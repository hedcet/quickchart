import { Devvit, useAsync, useForm, useState } from "@devvit/public-api";
import md5 from "blueimp-md5";
import { isJSON } from "validator";

import { validate } from "./ajv.ts";
import { Actions } from "./config.ts";
import { IConfigs } from "./interface.ts";
import { has } from "lodash";

Devvit.configure({
  http: { domains: ["quickchart.io"] },
  media: true,
  redditAPI: true,
  redis: true,
});

const defaultChart = {
  data: {
    datasets: [{ label: "Value", data: [256, 512] }],
    labels: ["Q1", "Q10"],
  },
  type: "line",
};

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
    await ctx.redis.set(
      `${post.id}|configs`,
      JSON.stringify({
        mods: [ctx.userId],
        charts: [defaultChart],
        refs: { [md5(JSON.stringify(defaultChart))]: "placeholder.png" },
      } as IConfigs),
    );
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
  async function getConfigs() {
    const configs = await ctx.redis.get(`${ctx.postId}|configs`);
    return configs && isJSON(configs) ? JSON.parse(configs) : {};
  }

  const [configs, setConfigs] = useState(async () => await getConfigs());

  function getWidthMin(width: number) {
    const widths = [718, 512, 400, 343, 288];
    return widths.find((w) => w <= width) || widths[widths.length - 1];
  }

  const height = ctx.dimensions?.height || 512; // regular=320, tall=512
  const width = getWidthMin(ctx.dimensions?.width || 288);

  function getCharts(charts: any[], refs: any = {}) {
    return charts.map((chart) => {
      const hash = md5(JSON.stringify(chart));
      return refs[`${hash}|${width}`] || refs[hash] || "error.png";
    });
  }

  const [chartIndex, setChartIndex] = useState(0);
  const [charts, setCharts] = useState(
    getCharts(
      configs?.charts?.length ? configs.charts : [defaultChart],
      configs?.refs,
    ),
  );

  function isMod() {
    return configs?.mods?.includes(ctx.userId) || ctx.userId === "t2_tnr2e"; // u/HedCET
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
          defaultValue: JSON.stringify(configs, null, 2),
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
      if (r.configs && isJSON(r.configs)) {
        const configs: IConfigs = JSON.parse(r.configs);
        if (validate(configs)) {
          await Promise.all(
            configs.charts.map(async (chart) => {
              const hash = md5(JSON.stringify(chart));
              // refs[hash] = fetch()
            }),
          );
          await ctx.redis.set(`${ctx.postId}|configs`, JSON.stringify(configs));
          setConfigs(configs);
        } else {
          const [error] = validate.errors!;
          showToast(error.message || "invalid configs");
        }
      } else showToast("invalid json");
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
          url={charts[chartIndex]}
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
          {0 < chartIndex && (
            <button
              icon="left-outline"
              onPress={() => setChartIndex(chartIndex - 1)}
              size="small"
            />
          )}
          {isMod() && (
            <button
              icon="customize-outline"
              onPress={() => ctx.ui.showForm(customizeForm)}
              size="small"
            />
          )}
          <spacer grow />
          {1 < charts.length && chartIndex < charts.length - 1 && (
            <button
              icon="right-outline"
              onPress={() => setChartIndex(chartIndex + 1)}
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
