import Image from "next/image";
import { ImgHTMLAttributes } from "react";

export function AppIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <Image alt='app-icon' {...props} src="/icon.png" width={40} height={40} />;
}