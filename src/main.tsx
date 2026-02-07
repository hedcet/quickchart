import { Devvit, useForm, useState } from "@devvit/public-api";
import { js as beautify } from "js-beautify";

Devvit.configure({
  // http: { domains: ["quickchart.io"] },
  media: true,
  redditAPI: true,
  redis: true,
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
    await ctx.redis.set(post.id, _chart);
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
  async function getChart(key: string): Promise<string> {
    return (await ctx.redis.get(key))!;
  }

  const [chart, setChart] = useState(async () => await getChart(ctx.postId!));

  function getWidthMin(width: number) {
    return _widths.find((w) => w <= width) || _widths[_widths.length - 1];
  }

  const height = ctx.dimensions?.height || 512; // regular=320, tall=512
  const width = getWidthMin(ctx.dimensions?.width || 288);

  async function getChartUrl(key: string, width: number): Promise<string> {
    const k = `${key}|${width}`;
    const cache = await ctx.redis.get(k);
    if (cache) return cache;
    const chart = await getChart(key);
    const { mediaUrl } = await ctx.media.upload({
      type: "image",
      url: `${_api}?w=${width}&v=4&h=512&c=${encodeURIComponent(chart)}`, // version=4
    });
    await ctx.redis.set(k, mediaUrl);
    return mediaUrl;
  }

  const [chartUrl, setChartUrl] = useState(
    async () => await getChartUrl(ctx.postId!, width),
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

  function showToast(text: string) {
    ctx.ui.showToast(text);
  }

  const customizeForm = useForm(
    {
      acceptLabel: "save",
      cancelLabel: "cancel",
      fields: [
        {
          defaultValue: format(chart),
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
      await ctx.redis.set(ctx.postId!, r.configs);
      for (const w of _widths) await ctx.redis.set(`${ctx.postId}|${w}`, "");
      setChart(r.configs);
      setChartUrl(await getChartUrl(ctx.postId!, width));
      // showToast("customized");
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
          url={chartUrl}
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
              onPress={() => ctx.ui.showForm(customizeForm)}
              size="small"
            />
          )}
        </hstack>
      </vstack>
    </zstack>
  );
};

Devvit.addCustomPostType({ height: "tall", name: "quickchart", render: App });

export default Devvit;
