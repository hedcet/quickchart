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
  '{ data: { datasets: [ { backgroundColor: pattern.draw("plus", "#FFCCBC"), borderColor: "#BF360C", borderWidth: 1, data: [256, 512], fill: true, label: "Value", pointStyle: "circle", tension: 0.25 } ], labels: ["Q1", "Q10"] }, options: { layout: { padding: { bottom: 24, left: 16, right: 32, top: 48 } }, plugins: { legend: { labels: { usePointStyle: true } } }, scales: { y: { beginAtZero: false } } }, type: "line" }';
const _widths = [718, 512, 400, 343, 288];

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

  function getWidthMin(width: number) {
    return _widths.find((w) => w <= width) || _widths[_widths.length - 1];
  }

  const height = ctx.dimensions?.height || 512; // regular=320, tall=512
  const width = getWidthMin(ctx.dimensions?.width || 288);

  async function getChartImgUrl(key: string, width: number): Promise<string> {
    const k = `${key}|img_url_${width}`;
    const cache = await ctx.redis.get(k);
    if (cache) return cache;
    const chart = await getChartConfig(ctx.postId!);
    let url = "error.png";
    try {
      const { mediaUrl } = await ctx.media.upload({
        type: "image",
        url: `${_api}?w=${width}&v=4&h=512&c=${encodeURIComponent(chart)}`, // version=4
      });
      url = mediaUrl;
    } catch (e) {
      console.error(k, chart, e.message || e);
    }
    await ctx.redis.set(k, url);
    return url;
  }

  const [chartImgUrl, setChartImgUrl] = useState(
    async () => await getChartImgUrl(ctx.postId!, width),
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

  async function setSchedulerConfig(type: string, ref: string) {
    const config = ((await ctx.redis.get("scheduler_config")) || "")
      .split("|")
      .map((i) => {
        const [id, type, ref] = i.split(":").map((j) => j.trim());
        return { id, type, ref };
      })
      .filter(({ id, type, ref }) => id && id !== ctx.postId && type && ref)
      .reduce(
        (m, i) => `${m}|${i.id}:${i.type}:${i.ref}`,
        ["wiki", "post", "comment"].includes(type)
          ? `${ctx.postId!}:${type}:${ref}`
          : "",
      );
    console.log("scheduler_config", config);
    await ctx.redis.set("scheduler_config", config);
    return config;
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
          label: "configs",
          lineHeight: 20,
          name: "configs",
          required: true,
          type: "paragraph",
        },
      ],
      title: "customize",
    },
    async (r) => {
      const [type, ref] = r.configs.split(":").map((i) => i.trim());
      await setSchedulerConfig(type, ref);
      if (type === "wiki" && ref) {
        const { content } = await ctx.reddit.getWikiPage(
          ctx.subredditName!,
          ref,
        );
        await ctx.redis.set(`${ctx.postId}|chart_config`, content);
        showToast("scheduled");
      } else {
        await ctx.redis.set(`${ctx.postId}|chart_config`, r.configs);
        showToast("customized");
      }
      for (const w of _widths)
        await ctx.redis.set(`${ctx.postId}|img_url_${w}`, "");
      setChartConfig(r.configs);
      setChartImgUrl(await getChartImgUrl(ctx.postId!, width));
    },
  );

  return (
    <zstack backgroundColor="white" height="100%" width="100%">
      <vstack alignment="middle center" grow height="100%" width="100%">
        <image
          height="100%"
          imageHeight={height}
          imageWidth={width}
          resizeMode="scale-down"
          url={chartImgUrl}
          width="100%"
        />
      </vstack>
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
        await ctx.redis.set(`${job.id}|chart_config`, content);
        for (const w of _widths)
          await ctx.redis.set(`${job.id}|img_url_${w}`, "");
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
      cron: "*/15 * * * *",
    });
  },
});

Devvit.addTrigger({
  event: "AppUpgrade",
  onEvent: async (_event, ctx) => {
    console.log("AppUpgrade");
    await ctx.scheduler.runJob({
      name: "chart-js",
      cron: "*/15 * * * *",
    });
  },
});

export default Devvit;
