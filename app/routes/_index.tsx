import {   Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious, } from "~/components/ui/pagination";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { prisma } from "~/prisma.server";



const PAGE_SIZE = 5  // 每页显示的文章数量

export const loader = async (c: LoaderFunctionArgs) => {
  // 从 URL 中获取当前页码，如果没有则默认为第 1 页
  const search = new URL(c.request.url).searchParams
  const page = Number(search.get('page') || 1)

  // 使用 prisma 同时查询文章列表和总文章数
  const [posts, total] = await prisma.$transaction([
    // 查询文章列表
    prisma.post.findMany({
      orderBy: { created_at: "desc" },  // 按创建时间倒序
      take: PAGE_SIZE,                  // 每次取 PAGE_SIZE 条数据
      skip: (page - 1) * PAGE_SIZE      // 跳过前面页的数据
    }),
    // 查询总文章数
    prisma.post.count()
  ])

  return json({
    posts,                              // 当前页的文章列表
    pageCount: Math.ceil(total / PAGE_SIZE)  // 总页数
  })
}


export default function Index() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const pageCount = loaderData.pageCount

  // 生成要显示的页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (pageCount <= 5) {
      return Array.from({length: pageCount}, (_, i) => i + 1)
    }

    if (page <= 3) {
      pages.push(1, 2, 3, 4, '...', pageCount)
    } else if (page >= pageCount - 2) {
      pages.push(1, '...', pageCount - 3, pageCount - 2, pageCount - 1, pageCount)
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', pageCount)
    }

    return pages
  }

  return (
    <div>
      <div className="p-12 flex flex-col gap-4">
        {loaderData.posts.map(post => {
          return (
            <div key={post.id}>
              <Link to={`/posts/${post.id}`} className="text-xl">
                {post.title}
              </Link>
              <div className="text-sm text-gray-400">
                {post.created_at}
              </div>
            </div>
          )
        })}
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={`?page=${page - 1}`}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === '...' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink 
                      href={`?page=${pageNumber}`}
                      isActive={pageNumber === page}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  href={`?page=${page + 1}`}
                  aria-disabled={page >= pageCount}
                  className={page >= pageCount ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
      </div>
    </div>
  );
}