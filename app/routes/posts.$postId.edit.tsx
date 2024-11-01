import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData,useNavigation,useFetcher } from "@remix-run/react";
import { prisma } from "~/prisma.server";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";



// 加载文章数据
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const postId = params.postId;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Response("找不到文章", {
      status: 404,
    });
  }

  return json({ post });
};

// 处理更新请求
export const action = async ({ params, request }: ActionFunctionArgs) => {
  const postId = params.postId;
  const formData = await request.formData();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // 表单验证
  if (!title || !content) {
    return json({
      success: false,
      errors: {
        title: title ? "" : "必须填写标题",
        content: content ? "" : "必须填写内容",
      },
    });
  }

  await new Promise(resolve => setTimeout(resolve, 3000));  // 模拟网络延迟
  // 更新文章
  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      title,
      content,
    },
  });

  // 更新成功后重定向到文章页
  return redirect(`/posts/${postId}`);
};

export default function EditPost() {
  const { post } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  console.log('navigation',navigation)
  const deleteFetcher = useFetcher()
  console.log('deleteFetcher',deleteFetcher)

  const isDeleting = deleteFetcher.state === 'submitting'
  console.log('isDeleting',isDeleting)
  const isEditing = navigation.state === 'submitting' && navigation.formData?.get("action") === 'edit'

  return (
    <div className="container py-8">
      <Form method="POST" className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">编辑文章</h1>
          </div>

          {actionData?.errors && (
            <div className="rounded-md bg-destructive/15 p-3 text-destructive">
              {actionData.errors.title && <p>{actionData.errors.title}</p>}
              {actionData.errors.content && <p>{actionData.errors.content}</p>}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                文章标题
              </label>
              <Input
                id="title"
                name="title"
                defaultValue={post.title}
                placeholder="输入文章标题"
                disabled={isEditing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                文章内容
              </label>
              <Textarea
                id="content"
                name="content"
                defaultValue={post.content}
                placeholder="输入文章内容"
                rows={10}
                disabled={isEditing}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
        <Button 
              name="action" 
              value="edit"
              type="submit"
              disabled={isEditing}
            >
              {isEditing ? "保存中..." : "保存修改"}
            </Button>
        </div>
        </Form>

          <deleteFetcher.Form method="POST" action={`/posts/${post.id}/delete`}>
          <Button 
              name="action" 
              value="delete"
              type="submit"
              variant="destructive" 
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "删除"}
            </Button>
            </deleteFetcher.Form>
    </div>
  );
}
