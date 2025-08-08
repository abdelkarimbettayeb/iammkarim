'use client'
import React, { PropsWithChildren, useMemo, useRef } from 'react';
import { bebas, ubuntu } from '../app/helpers/fonts';

export default function MyCard({ children, title, flip, className }: PropsWithChildren & { title: string; flip?: boolean; className?: string }) {

    const containerRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)

    const { width, height } = useElementSize(containerRef);

    const { width: tWidthx, height: tHeightx } = useElementSize(titleRef);

    const d = useMemo(() => {
        const radius = tWidthx / 5;
        const tWidth = tWidthx + 30;
        const tHeight = tHeightx * 1.5;

        const d = `M0,${tHeight + radius}
            C0,${tHeight} ${radius},${tHeight} ${radius},${tHeight}
            L0,${tHeight} L${tWidth},${tHeight}
            C${tWidth},${tHeight} ${radius + tWidth},${tHeight} ${radius + tWidth},${tHeight - radius}
            L${radius + tWidth},${radius} C${radius + tWidth},0 ${radius * 2 + tWidth},0 ${radius * 2 + tWidth},0
            L${width - radius},0 C${width},0 ${width},${radius} ${width},${radius}
            L${width},${height - radius} C${width},${height} ${width - radius},${height} ${width - radius},${height}
            L${radius},${height} C0,${height} 0,${height - radius} 0,${height - radius}
            z`;

        return d;
    }, [height, tHeightx, tWidthx, width]);

    return (
        <section
            ref={containerRef}
            className='rounded-2xl relative py-6 sm:py-12 px-6 sm:px-12 pt-3 sm:pt-7 flex flex-col sm:grid sm:grid-cols-[auto_1fr] gap-2'>

            <h2
                ref={titleRef}
                style={{
                    ...bebas.style,
                }} className={'sticky top-[60px] z-10 col-[1/3] row-[1/2] text-2xl sm:text-6xl w-max font-bold text-linear-color-2' + (flip ? ' justify-self-end ms-auto' : '')}>
                {title}
            </h2>

            <div className={'col-[2/3] row-[2/3] z-20 text-justify mt-5 sm:mt-10 ' + ubuntu.className + ' ' + (className ?? '')}>
                {children}
            </div>

            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMinYMin"
                xmlns="http://www.w3.org/2000/svg"
                className={'absolute z-10 bottom-0 left-0' + (flip ? '  -scale-x-100' : '')}>
                <path
                    d={d}
                    className='bg-path backdrop-blur-xl'
                />
            </svg>
        </section>
    )
}

import { useEffect, useState } from 'react';

export function useElementSize<T extends HTMLElement>(ref: React.RefObject<T | null>) {
    const [size, setSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const updateSize = () => {
            const width = element.clientWidth, height = element.clientHeight;

            setSize({ width: Math.floor(width), height: Math.floor(height) })
        }

        // Initial size
        updateSize()

        // Observe size changes
        const observer = new ResizeObserver(() => updateSize())
        observer.observe(element)

        // Cleanup
        return () => observer.disconnect()
    }, [ref])

    return size
}
