"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/shared-ui/components/common/breadcrumb";
import { convertCase } from "@repo/shared/utils";
import { usePathname } from "next/navigation";

export function HeaderBreadcrumb() {
  const pathname = usePathname();

  const paths = pathname.split("/").flatMap((t) => [t]);

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          {paths.map((path, i) => (
            <>
              <BreadcrumbItem className="hidden md:block">
                {i === paths.length - 1 ? (
                  <>
                    <BreadcrumbPage>
                      {convertCase(path, "kebab", "title")}
                    </BreadcrumbPage>
                  </>
                ) : (
                  <>{convertCase(path, "kebab", "title")}</>
                )}
              </BreadcrumbItem>
              {i < paths.length - 1 && i !== 0 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
