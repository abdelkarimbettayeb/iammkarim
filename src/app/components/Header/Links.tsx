'use client';

import React, { HTMLAttributes } from 'react';
import { Link } from 'react-scroll';

export default function Links(props: HTMLAttributes<HTMLUListElement>) {
    return (
        <ul {...props}>
            <Link activeClass="active" containerId='scrollContainer' to="about" spy={true} smooth={true} offset={-60} duration={500}>
                <li>
                    About
                </li>
            </Link>
            {/* <Link activeClass="active" containerId='scrollContainer' to="education" spy={true} smooth={true} offset={-60} duration={500}>
                <li>
                    Education
                </li>
            </Link> */}
            <Link activeClass="active" containerId='scrollContainer' to="skills" spy={true} smooth={true} offset={-60} duration={500}>
                <li>
                    Skills
                </li>
            </Link>
            <Link activeClass="active" containerId='scrollContainer' to="projects" spy={true} smooth={true} offset={-60} duration={500}>
                <li>
                    Projects
                </li>
            </Link>
            <Link activeClass="active" containerId='scrollContainer' to="testimonials" spy={true} smooth={true} offset={-60} duration={500}>
                <li>
                    Testimonials
                </li>
            </Link>
            <Link activeClass="active" containerId='scrollContainer' to="reach-me" spy={true} smooth={true} offset={-60} duration={500}>
                <li>
                    Reach me
                </li>
            </Link>
        </ul>
    );
}
