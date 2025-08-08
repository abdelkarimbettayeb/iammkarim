// components/TypingTitles.tsx
'use client';

import React, { useEffect, useState } from 'react';

const titles = [
    'Full-Stack Web Developer 👨‍💻',
    'UI/UX Designer 💡',
    'Debugging Master 🐞',
    'Tech Enthusiast 👨‍💻',
];

const TypingTitles: React.FC = () => {
    const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100); // ms

    useEffect(() => {
        const currentTitle = titles[currentTitleIndex];

        const timeout = setTimeout(() => {
            if (isDeleting) {
                setDisplayedText((prev) => prev.slice(0, -1));
                setTypingSpeed(50);
            } else {
                setDisplayedText((prev) => currentTitle.slice(0, prev.length + 1));
                setTypingSpeed(100);
            }

            // When fully typed
            if (!isDeleting && displayedText === currentTitle) {
                setTimeout(() => setIsDeleting(true), 1000);
            }

            // When fully deleted
            if (isDeleting && displayedText === '') {
                setIsDeleting(false);
                setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
            }
        }, typingSpeed);

        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, currentTitleIndex, typingSpeed]);

    return (
        <span className="text-center mt-2 h-8">
            <span>{displayedText}</span>
            <span className="animate-blink">|</span>
        </span>
    );
};

export default TypingTitles;
