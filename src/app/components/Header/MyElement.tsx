'use client';

import React, { PropsWithChildren } from 'react';
import { Element } from 'react-scroll';

export default function MyElement({ name, children }: PropsWithChildren<{ name: string; }>) {
    return (
        <Element name={name} id={name}>
            {children}
        </Element>
    );
}
