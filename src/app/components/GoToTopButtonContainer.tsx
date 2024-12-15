'use client';

import { HTMLAttributes, useLayoutEffect, useRef, useState } from 'react';
import { TransparentButton } from './TransparentButton';
import { FaArrowUp } from 'react-icons/fa';

export default function GoToTopButtonContainer({ children, ...props }: HTMLAttributes<HTMLElement>) {

    const mainRef = useRef<HTMLDivElement>(null);

    const scrollTop = useScrollTop(mainRef);

    const onGoToTop = () => {
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div {...props} ref={mainRef}>
            {children}
            <TransparentButton
                onClick={() => onGoToTop()}
                className='fixed m-10 bottom-0 end-0 !shadow-lg shadow-black z-20' style={{
                    opacity: scrollTop === 0 || scrollTop === null ? 0 : 1,
                    backgroundColor: 'rgb(62 63 68)'
                }}>
                <FaArrowUp />
            </TransparentButton>
        </div>
    );
}


function debounce(func: () => void, timeout = 100) {
    let timer: number;
    return () => {
        clearTimeout(timer);
        timer = window.setTimeout(func, timeout);
    };
}

function useScrollTop(ref: React.RefObject<HTMLDivElement>) {
    const [scrollTop, setScrollTop] = useState<number | null>(null);

    useLayoutEffect(() => {
        const cur = ref.current;
        if (cur === null)
            return;

        const onScroll = debounce(() => {

            if (cur === null)
                return;

            setScrollTop(cur.scrollTop);
        });

        cur.addEventListener('scroll', onScroll);
        return () => {
            cur.removeEventListener('scroll', onScroll);
        };
    }, [ref]);

    return scrollTop;
}