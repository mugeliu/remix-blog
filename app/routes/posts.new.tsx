import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, json, useActionData, useNavigation } from "@remix-run/react";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { prisma } from "~/prisma.server";

type FormFields = {
  slug: string;
  title: string;
  content: string;
};

const validateField = (field: keyof FormFields, value: string) => {
  const messages = {
    slug: "必须填写 slug",
    title: "必须填写标题",
    content: "必须填写内容"
  };
  
  return !value ? messages[field] : "";
};

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const fields = {
    slug: formData.get("slug") as string,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
  };

  const errors: Record<keyof FormFields, string> = {
    slug: validateField("slug", fields.slug),
    title: validateField("title", fields.title),
    content: validateField("content", fields.content),
  };

  if (Object.values(errors).some(error => error)) {
    return json({
      success: false,
      errors,
    });
  }

  await new Promise(resolve => setTimeout(resolve, 3000));  // 模拟网络延迟

  await prisma.post.create({
    data: {
      id: fields.slug,
      title: fields.title,
      content: fields.content,
    },
  });

  return redirect("/");
};


export default function Page() {
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "发布中..." : "发布文章"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
