import { Tooltip } from "@mantine/core";
import Image from "next/image";


const names = {
    react: 'ReactJs',
    mysql: 'MySQL',
    nodejs: 'NodeJs',
    'c#': 'C#',
    'c++': 'C++',
    php: 'PHP',
    postgresql: 'PostgreSQL',
    refine: 'Refine',
    figma: 'Figma',
    nextjs: 'NextJs',
    tailwind: 'TailwindCSS'
};

export function StackIcon({ name }: { name: string; }) {
    return <Tooltip label={(names as any)[name]}>
        <span className="rounded-lg flex w-[40px] h-[40px]">
            <Image alt={name} width={30} height={30} className="m-1 block" src={'/stack/' + (name === "c#" ? 'csharp' : name) + '.svg'} />
        </span>
    </Tooltip>;
}
