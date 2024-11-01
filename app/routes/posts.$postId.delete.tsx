import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { prisma } from "~/prisma.server";
import {useFetcher } from "@remix-run/react";
  

export const action = async ({ params }: ActionFunctionArgs) => {
  const postId = params.postId;

//   await prisma.post.delete({
//     where: { id: postId },
//   });

    console.log('删除请求到了这里')
  await new Promise(resolve => setTimeout(resolve, 3000)); 
  return redirect("/");
};
