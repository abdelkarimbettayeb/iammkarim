import { BiLogoPostgresql } from "react-icons/bi";
import { FaReact, FaFigma } from "react-icons/fa";
import { RiNodejsLine, RiNextjsFill, RiTailwindCssFill } from "react-icons/ri";
import { SiCsharp, SiPhp, SiRefine } from "react-icons/si";
import { TbBrandMysql, TbBrandCpp } from "react-icons/tb";
import { gold } from "../helpers/constants";
import { Tooltip } from "@mantine/core";


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
            <img width={30} height={30} className="m-1 block" src={'/stack/' + (name === "c#" ? 'csharp' : name) + '.svg'} />
        </span>
    </Tooltip>;
}
