/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare module "next" {
  export interface Metadata {
    title?: string | { default: string; template: string };
    description?: string;
    icons?: any;
    keywords?: string | string[];
    authors?: any;
    creator?: string;
    publisher?: string;
    openGraph?: any;
    twitter?: any;
    viewport?: any;
    themeColor?: any;
    manifest?: string;
    alternates?: any;
  }
}

declare module "next/link" {
  import React, { ComponentProps, ForwardRefExoticComponent, RefAttributes } from "react";
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
  }
  const Link: ForwardRefExoticComponent<LinkProps & RefAttributes<HTMLAnchorElement>>;
  export default Link;
}

declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): {
    push(url: string): void;
    replace(url: string): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(url: string): void;
  };
  export function useSearchParams(): URLSearchParams;
  export function useParams<T = Record<string, string | string[]>>(): T;
}

declare module "next/font/google" {
  export function Inter(options?: { subsets?: string[]; weight?: string[] }): {
    className: string;
    style: { fontFamily: string };
  };
}
