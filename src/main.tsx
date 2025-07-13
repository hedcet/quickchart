import { Devvit, useAsync, useForm, useState } from "@devvit/public-api";
import { isJSON, isURL } from "validator";

import { Actions } from "./config.ts";
import { IConfigs, IProps } from "./interface.ts";

Devvit.configure({
  http: { domains: ["quickchart.io"] },
  media: true,
  redditAPI: true,
  redis: true,
});

Devvit.addMenuItem({
  forUserType: "moderator",
  label: "add quickchart post",
  location: "subreddit",
  onPress: async (_event, ctx) => {
    const post = await ctx.reddit.submitPost({
      title: "highlights",
      subredditName: ctx.subredditName!,
      preview: (
        <vstack alignment="middle center" grow>
          <text size="large">loading...</text>
        </vstack>
      ),
    });
    await ctx.redis.set(
      `${post.id}|configs`,
      JSON.stringify({
        mods: [ctx.userId],
      })
    );
    ctx.ui.navigateTo(post);
  },
});

const App: Devvit.CustomPostComponent = (ctx: Devvit.Context) => {
  async function getConfigs() {
    const configs = await ctx.redis.get(`${ctx.postId}|configs`);
    return configs && isJSON(configs) ? JSON.parse(configs) : {};
  }

  function getPrefix(suffix: string) {
    return `${ctx.postId}|highlight-${suffix}`;
  }

  const [configs, setConfigs] = useState(async () => await getConfigs());
  const [action, setAction] = useState(Actions.Dummy);

  function showToast(text: string) {
    ctx.ui.showToast(text);
  }

  const customizeForm = useForm(
    {
      acceptLabel: "save",
      description: "refer ~ github.com/hedcet/quickchart",
      fields: [
        {
          defaultValue: JSON.stringify(configs, null, 2),
          label: "configs",
          lineHeight: 15,
          name: "configs",
          required: true,
          type: "paragraph",
        },
      ],
    },
    async (r) => {
      if (r.configs && isJSON(r.configs)) {
      } else showToast("invalid json");
    }
  );

  function customize() {
    ctx.ui.showForm(customizeForm);
  }

  async function download() {}

  const props: IProps = {
    mod: configs.mods?.includes(ctx.userId) || ctx.userId === "t2_tnr2e", // u/HedCET
    setAction,
    // actionLoading,
    showToast,
    customize,
    download,
  };

  return (
    <zstack height="100%" width="100%">
      <vstack alignment="middle center" grow height="100%" width="100%">
        <text>roof-builds-foundation</text>
      </vstack>
      <vstack width="100%">
        <hstack
          alignment="middle center"
          gap="small"
          padding="medium"
          width="100%"
        >
          <button icon="back" />
          <button icon="customize" />
          <spacer grow />
          <button icon="forward" />
        </hstack>
      </vstack>
    </zstack>
  );
};

Devvit.addCustomPostType({ height: "tall", name: "quickchart", render: App });

export default Devvit;
