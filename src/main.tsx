import { Devvit, useForm, useState } from "@devvit/public-api";
import { js as beautify } from "js-beautify";

Devvit.configure({
  media: true,
  redditAPI: true,
  redis: true,
  scheduler: true,
});

const _api = "https://quickchart.io/chart";
const _chart =
  '{ data: { datasets: [ { backgroundColor: pattern.draw("plus", "#FFCCBC"), borderColor: "#BF360C", borderWidth: 1, data: [256, 512], fill: true, label: "Value", pointStyle: "circle", tension: 0.25 } ], labels: ["Q1", "Q10"] }, options: { layout: { padding: { bottom: 24, left: 8, right: 16, top: 48 } }, plugins: { legend: { labels: { usePointStyle: true } } }, scales: { y: { beginAtZero: false } } }, type: "line" }';

function format(s: string) {
  return beautify(s, {
    indent_size: 2,
    space_in_empty_paren: true,
  });
}

const postForm = Devvit.createForm(
  {
    acceptLabel: "submit",
    cancelLabel: "cancel",
    fields: [
      {
        defaultValue: "highlights",
        label: "title",
        name: "title",
        required: true,
        type: "string",
      },
    ],
    title: "post",
  },
  async (e, ctx) => {
    const post = await ctx.reddit.submitPost({
      preview: (
        <vstack alignment="middle center" grow>
          <text size="large">loading...</text>
        </vstack>
      ),
      subredditName: ctx.subredditName!,
      title: e.values.title,
    });
    await ctx.redis.set(`${post.id}|chart_config`, _chart);
    ctx.ui.navigateTo(post);
  },
);

Devvit.addMenuItem({
  forUserType: "moderator",
  label: "post chart-js template",
  location: "subreddit",
  onPress: (_e, ctx) => ctx.ui.showForm(postForm),
});

const App: Devvit.CustomPostComponent = (ctx: Devvit.Context) => {
  async function getChartConfig(key: string): Promise<string> {
    return (await ctx.redis.get(`${key}|chart_config`)) || _chart;
  }

  const [chartConfig, setChartConfig] = useState(
    async () => await getChartConfig(ctx.postId!),
  );

  const height = Math.round(ctx.dimensions?.height || 512); // regular=320, tall=512
  const width = Math.round(ctx.dimensions?.width || 288);

  async function getChartImageUrl(
    postId: string,
    options: { width: number; height: number },
  ): Promise<string> {
    const k = `${postId}|images`;
    const hash = `w${options.width}|h${options.height}`;
    const cache = await ctx.redis.hGet(k, hash);
    if (cache) return cache;
    const chart = await getChartConfig(postId);
    let url = "error.png";
    try {
      const { mediaUrl } = await ctx.media.upload({
        type: "image",
        url: `${_api}?w=${options.width}&v=4&h=${options.height}&f=webp&c=${encodeURIComponent(chart)}`, // theme=white, version=4
      });
      url = mediaUrl;
    } catch (e: any) {
      console.error(k, chart, e.message || e);
    }
    console.log(k, { [hash]: url });
    await ctx.redis.hSet(k, { [hash]: url });
    return url;
  }

  const [chartImgUrl, setChartImgUrl] = useState(
    async () => await getChartImageUrl(ctx.postId!, { width, height }),
  );

  async function getModFlag(): Promise<boolean> {
    const r = await ctx.reddit.getModerators({
      subredditName: ctx.subredditName!,
    });
    return (
      !!(r.children || []).some((mod: any) => mod.id === ctx.userId) ||
      ctx.userId === "t2_tnr2e" // u/HedCET
    );
  }

  const [modFlag, setModFlag] = useState(async () => await getModFlag());

  async function setSchedulerConfig(id: string, type: string, ref: string) {
    const job = `${id}:${type}:${ref}`;
    const k = "scheduler_config";
    const v = ((await ctx.redis.get(k)) || "")
      .split("|")
      .map((i) => {
        const [_id, _type, _ref] = i.split(":").map((j) => j.trim());
        return { _id, _type, _ref };
      })
      .filter(({ _id, _type, _ref }) => _id && _id !== id && _type && _ref)
      .reduce(
        (m, i) => `${m ? `${m}|` : ""}${i._id}:${i._type}:${i._ref}`,
        ["wiki"].includes(type) ? job : "",
      );
    console.log(job, k, v);
    await ctx.redis.set(k, v);
    return v;
  }

  function showToast(text: string) {
    ctx.ui.showToast(text);
  }

  const customizeForm = useForm(
    {
      acceptLabel: "save",
      cancelLabel: "cancel",
      fields: [
        {
          defaultValue: format(chartConfig),
          label: "config",
          lineHeight: 20,
          name: "config",
          required: true,
          type: "paragraph",
        },
      ],
      title: "customize",
    },
    async (r) => {
      const [type, ref] = r.config.split(":").map((i) => i.trim());
      await setSchedulerConfig(ctx.postId!, type, ref);
      let config = r.config;
      if (type === "wiki" && ref) {
        const { content } = await ctx.reddit.getWikiPage(
          ctx.subredditName!,
          ref,
        );
        config = content;
        showToast("scheduled");
      } else {
        showToast("customized");
      }
      if (config === chartConfig) return;
      await ctx.redis.set(`${ctx.postId}|chart_config`, config);
      await ctx.redis.del(`${ctx.postId}|images`);
      setChartConfig(config);
      setChartImgUrl(await getChartImageUrl(ctx.postId!, { width, height }));
    },
  );

  return (
    <zstack backgroundColor="white" height="100%" width="100%">
      <image
        height="100%"
        imageHeight={height}
        imageWidth={width}
        resizeMode="fill"
        url={chartImgUrl}
        width="100%"
      />
      <vstack width="100%">
        <hstack
          alignment="middle center"
          gap="small"
          padding="medium"
          width="100%"
        >
          <spacer grow />
          {modFlag && (
            <button
              icon="customize-outline"
              onPress={() => {
                if (!modFlag) return;
                ctx.ui.showForm(customizeForm);
              }}
              size="small"
            />
          )}
        </hstack>
      </vstack>
    </zstack>
  );
};

Devvit.addCustomPostType({ height: "tall", name: "quickchart", render: App });

Devvit.addSchedulerJob({
  name: "chart-js",
  onRun: async (_event, ctx) => {
    for (const job of ((await ctx.redis.get("scheduler_config")) || "")
      .split("|")
      .map((i) => {
        const [id, type, ref] = i.split(":").map((j) => j.trim());
        return { id, type, ref };
      })
      .filter((i) => i.id && i.type === "wiki" && i.ref)) // post/comment
      try {
        console.log(job);
        const { content } = await ctx.reddit.getWikiPage(
          ctx.subredditName!,
          job.ref,
        );
        const k = `${job.id}|chart_config`;
        if (content === (await ctx.redis.get(k))) continue;
        await ctx.redis.set(k, content);
        await ctx.redis.del(`${job.id}|images`);
      } catch (e) {
        console.error(e);
      }
  },
});

Devvit.addTrigger({
  event: "AppInstall",
  onEvent: async (_event, ctx) => {
    console.log("AppInstall");
    await ctx.scheduler.runJob({
      name: "chart-js",
      cron: "15 * * * *",
    });
  },
});

Devvit.addTrigger({
  event: "AppUpgrade",
  onEvent: async (_event, ctx) => {
    console.log("AppUpgrade");
    try {
      const jobs = await ctx.scheduler.listJobs();
      if (!jobs.some((i) => i.name === "chart-js"))
        await ctx.scheduler.runJob({
          name: "chart-js",
          cron: "15 * * * *",
        });
    } catch (e) {
      console.error(e);
    }
  },
});

export default Devvit;
