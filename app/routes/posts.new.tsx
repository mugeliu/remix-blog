import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, json, useActionData, useNavigation } from "@remix-run/react";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { prisma } from "~/prisma.server";

export const action = async (c: ActionFunctionArgs) => {
  const formData = await c.request.formData();

  const slug = formData.get("slug") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!slug) {
    return json({
      success: false,
      errors: {
        slug: "必须填写 slug",
        title: "",
        content: "",
      },
    });
  }
  if (!title) {
    return json({
      success: false,
      errors: {
        slug: "",
        title: "必须填写标题",
        content: "",
      },
    });
  }
  if (!content) {
    return json({
      success: false,
      errors: {
        slug: "",
        title: "",
        content: "必须填写内容",
      },
    });
  }
  await prisma.post.create({
    data: {
      id: slug,
      title,
      content,
    },
  });

  return redirect(`/`);
};

export default function Page() {
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;
  const navigation = useNavigation()

  return (
    <div className="container py-8">
      <Form method="POST" className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">发布文章</h1>
            <p className="text-muted-foreground">创建一篇新的博客文章</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-medium">
                文章路径
              </label>
              <Input
                id="slug"
                name="slug" 
                placeholder="my-first-post"
                aria-describedby="slug-error"
              />
              {errors?.slug && (
                <p className="text-sm text-destructive" id="slug-error">
                  {errors.slug}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                文章标题
              </label>
              <Input
                id="title"
                name="title"
                placeholder="输入文章标题"
                aria-describedby="title-error"
              />
              {errors?.title && (
                <p className="text-sm text-destructive" id="title-error">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                文章内容
              </label>
              <Textarea
                id="content"
                name="content"
                placeholder="输入文章内容"
                rows={10}
                aria-describedby="content-error"
              />
              {errors?.content && (
                <p className="text-sm text-destructive" id="content-error">
                  {errors.content}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={navigation.state === "submitting"}
              className="w-full"
            >
              {navigation.state === "submitting" ? "发布中..." : "发布文章"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
