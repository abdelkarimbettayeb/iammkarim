import { Button, Tooltip } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { HTMLAttributes } from 'react';
import { FaFacebook, FaGithub, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { MdDownload, MdEmail, MdLocationCity } from 'react-icons/md';
import ClientLink from './components/ClientLink';
import MyElement from './components/Header/MyElement';
import ReachMe from './components/ReachMe';
import { TransparentButton } from './components/TransparentButton';
import { gold } from './helpers/constants';
import { saira, ubuntu } from './helpers/fonts';
const FaStarHtml = '<svg class="inline" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg" color="#FFC86B" style="color: rgb(255, 200, 107);"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>';

const { projects, skills, testimonials, achievements } = {
    skills: [
        {
            name: 'ReactJS',
            icon: 'react.png',
            description: 'Ensured interactivity and smooth UX.'
        },
        {
            name: 'NextJs',
            icon: 'nextjs.png',
            description: 'Backend/frontend code, reducing boilerplate code.'
        },
        {
            name: 'NodeJS',
            icon: 'nodejs.png',
            description: 'Robust backend functionality with expressJs.'
        },
        {
            name: 'Tailwind',
            icon: 'tailwind.png',
            description: 'Design vision and responsiveness across devices.'
        },
        {
            name: 'PostgreSQL',
            icon: 'pgsql.png',
            description: 'Effective data management.'
        },
        {
            name: 'Refine.dev',
            icon: 'refine.png',
            description: 'Admin dashboards for all project designs.'
        },
        {
            name: 'C# .NET',
            icon: 'csharp.png',
            description: 'Developed administrative tools.'
        }
    ],
    achievements: [
        {
            title: 'Payment Gateway Integration',
            number: '10+',
            subtitle: 'Integrated over 10 payment gateways over more than 5 different platforms.',
        },
        {
            title: 'Web Scraping Tools',
            number: '8+',
            subtitle: 'Developed over 8 web scraping tools for various goals.',
        },
        {
            title: 'Solved Complex Problems',
            number: '10+',
            subtitle: 'Solved over 10 complex problems for various cleints with different programming languages and platforms.',
        },
        {
            title: 'Web Applications Development / Customization',
            number: '10+',
            subtitle: 'Developed over 10 web applications for various platforms.',
        },
        {
            title: 'Bots Development',
            number: '5+',
            subtitle: 'Developed over 5 bots for various platforms (Whatsapp, Telegram, ...).',
        },
        {
            title: 'Uploaded Projects',
            number: '15+',
            subtitle: 'Uploaded over 10 websites to VPS hosts and configured them. as well as uploaded over 5 Mobiles apps to Google Play Store and Apple Store.',
        }
    ],
    projects: [
        {
            title: 'Restaurant Website Design (TastyTracks)',
            subtitle: 'Design & Implementation',
            stack: ['react', 'figma'],
            url: 'https://github.com/xnevz/TastyTracks',
            description: [
                'Designed and implemented a restaurant website with a user-friendly interface and smooth UX.',
                'Utilized <span class="text-linear-color">Figma</span> to create a visually appealing design, ensuring a seamless user experience.'
            ],
            image: '/projects/tasty-tracks.jpeg'
        },
        {
            title: 'Fullstack Website development (alnurayn.org)',
            subtitle: 'Current occupation',
            stack: ['react', 'nodejs', 'postgresql', 'refine', 'figma', 'c++', 'c#'],
            url: 'https://alnurayn.org',
            description: ['Utilizing <span class="text-linear-color">Refine</span> as the backend dashboard, <span class="text-linear-color">React</span> for the frontend, and <span class="text-linear-color">Node.js</span> for the backend, I have created a dynamic and efficient system.',
                'Incorporating <span class="text-linear-color">C++</span> for search operations has bolstered <span class="text-linear-color">performance</span>, reducing server load.',
                'Sharpened my <span class="text-linear-color">time management</span>, <span class="text-linear-color">commitment</span>, and <span class="text-linear-color">project management</span> skills, refining my ability to allocate resources effectively and select optimal tech stacks for tasks.'],
            image: '/projects/fullstack.jpeg'
        },
        {
            title: 'Independent contractor',
            subtitle: 'At Mostaql',
            url: 'https://mostaql.com/u/abdelkrime2055/reviews',
            stack: ['react', 'nodejs', 'mysql', 'c#', 'php', 'postgresql', 'figma'],
            description: [`Proud to showcase my extensive experience on Mostaql, where I have successfully completed <span class="text-linear-color">over 30 projects</span> with a stellar rating of ${FaStarHtml}${FaStarHtml}${FaStarHtml}${FaStarHtml}${FaStarHtml}, each delivered with precision and excellence.`,
                'That reflects my dedication to <span class="text-linear-color">exceeding client expectations</span> and delivering exceptional results.'
            ],
            image: '/projects/freelancer.png'
        },
        {
            title: 'NextJs Project',
            subtitle: 'This Portfolio',
            url: '/',
            stack: ['nextjs', 'figma', 'tailwind'],
            description: ['I began crafting <span class="text-linear-color">My Portfolio</span> as design in <span class="text-linear-color">Figma</span>, ensuring a <span class="text-linear-color">user-friendly</span>, <span class="text-linear-color">responsive</span> layout. Using <span class="text-linear-color">Next.js</span> as a <span class="text-linear-color">fullstack</span> framework reducing boilerplate code and enhancing <span class="text-linear-color">efficiency</span>.',
                'Leveraging <span class="text-linear-color">Tailwind CSS</span> enabled me to bring the design to life seamlessly, ensuring <span class="text-linear-color">responsiveness</span> across all devices.'
            ],
            image: '/projects/portfolio.jpeg'
        },
    ],
    // educations: [
    //     {
    //         title: 'Bachelor Degree',
    //         subtitle: 'Mathematics',
    //         location: 'Safya Yahia\'s High school, El matmar',
    //         date: '2014 - 2017'
    //     },
    //     {
    //         title: 'Masters Degree',
    //         subtitle: 'Computer Science',
    //         location: 'University Of Ahmad Zabana, Relizane',
    //         date: '2017 - 2022'
    //     }
    // ],
    testimonials: [
        // {
        //     name: 'John B.',
        //     country: 'United States',
        //     countryCode: 'us',
        //     description: ['Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, quae?Lorem ipsum dolor sit amet consecLorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, quae?Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, quae?Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo, quae?'],
        //     image: '/testimonials/john.jpg'
        // },
        {
            name: 'Mahmoud S.',
            country: 'Egypt',
            countryCode: 'eg',
            description: [
                'I <span class="text-linear-color">highly recommend</span> working with dear brother, Engineer Abdelkarim. Our experience working with him was more than wonderful in terms of <span class="text-linear-color">credibility</span>, <span class="text-linear-color">professionalism</span>, and <span class="text-linear-color">commitment</span> to delivering projects on time.',
                'We asked Engineer Abdelkarim to work on more than 5 projects, and all of them <span class="text-linear-color">exceeded our expectations</span>, as opposed to the sophisticated nature of the work, during our contract, he never gets tired of reviewing the project nor fail to propose <span class="text-linear-color">better</span>, <span class="text-linear-color">easier</span> and <span class="text-linear-color">safer solutions</span>. We ask God to bless his work and provide for him in ways he does not expect.'
            ],
            image: '/testimonials/john.jpg'
        },
        {
            name: 'Hani I.',
            country: 'Saudi Arabia',
            countryCode: 'sa',
            description: ['I would like to extend my <span class="text-linear-color">sincere gratitude</span> for the <span class="text-linear-color">exceptional services</span> provided. The individual demonstrated an exemplary level of <span class="text-linear-color">professionalism</span>, executing the required task with promptness and precision.',
                'Their dedication to their work is evident, characterized by sincerity and meticulous <span class="text-linear-color">attention to detail</span>. I express my heartfelt wishes for their continued success in all endeavors. 💚']
        },
        {
            name: 'Khaled A.',
            country: 'Yemen',
            countryCode: 'ye',
            description: ['Engineer Abdelkarim Bettayeb <span class="text-linear-color">exemplifies excellence</span> as a <span class="text-linear-color">first-class programmer</span>. Our collaboration on numerous projects has been exceedingly fruitful, and we continue to engage his services to the present day.',
                'Wishing him enduring success and prosperity in all his endeavors.']
        }
    ]
};

function SectionTitle(props: HTMLAttributes<HTMLDivElement>) {
    return <div style={{
        position: 'sticky',
        paddingTop: 20,
        paddingBottom: 5,
        top: 60,
        marginInline: -100,
        paddingInline: 100,
        zIndex: 11
    }} {...props}
        className={'bg-white backdrop-blur-md bg-opacity-5 border-b-[1px] border-t-[1px] border-opacity-5 border-solid border-white [&_*]:tracking-wider ' + props.className} />;
}

export default function Home() {

    return (
        <>
            {/* Landing */}
            <section className='landing-section min-h-screen h-full relative'>
                <div className='flex gap-20 items-center left-0 top-0 justify-evenly min-h-screen' style={{ width: 'calc(100% - 15px)' }}>
                    <div className='flex flex-col gap-4 items-start'>
                        <h1 className='flex flex-col'>
                            <span className='text-5xl'>I’m </span>
                            <span className='text-5xl sm:text-7xl text-linear-color'>Abdelkarim Bettayeb</span>
                        </h1>
                        <p className={'text-3xl sm:text-4xl typewriter text-wrap self-end ' + ubuntu.className} >Full-Stack Web Developer</p>

                        <div className='flex gap-5 flex-wrap justify-end self-end items-center'>

                            <Link target='blank' href='/Abdelkarim Bettayeb.pdf'>
                                <Button
                                    variant='gradient'
                                    color='cyan'
                                    size='xl'
                                    radius='md'>
                                    <span className='flex gap-2 items-center'>
                                        <span className='text-2xl text-dark font-bold'
                                        >RESUME</span>
                                        <MdDownload size={30} />
                                    </span>
                                </Button>
                            </Link>

                            <ClientLink spy smooth offset={-50} containerId='scrollContainer' to='reach-me'>
                                <Button
                                    size='xl'
                                    variant='gradient'
                                    className='h-max p-4 ps-6 pe-6 rounded-xl'>
                                    <span className='text-2xl -tracking-[0.7px] text-dark font-bold'>REACH OUT</span>
                                </Button>
                            </ClientLink>

                        </div>
                    </div>

                    <div style={{ gridColumn: '2/3' }} className='hidden md:flex gap-6'>
                        <div>
                            <h1 className={saira.className + ' xbg-semi-dark-linear rounded-[90px]'}
                                style={{
                                    fontSize: '25rem',
                                    lineHeight: '15rem',
                                    marginTop: '-4rem',
                                    padding: '3rem'
                                }}>
                                <span className='text-white'>A</span>
                                <span className='text-gold'>.</span>
                            </h1>
                        </div>
                        <div className='absolute top-10 right-0 flex flex-col gap-3 items-center self-end ms-auto'>
                            <span className='h-40 w-1 rounded-sm bg-white' />
                            <a target='_blank' href='https://facebook.com/mr.a.blizzard/'>
                                <FaFacebook size={30} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                            </a>
                            <a target='_blank' href='https://www.linkedin.com/in/karimbettayeb/'>
                                <FaLinkedin size={30} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                            </a>
                            <a target='_blank' href='https://github.com/xnevz/'>
                                <FaGithub size={30} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <div className='-m-5 sm:-m-10 ps-5 pe-5 sm:ps-10 sm:pe-10 relative pb-10 flex flex-col'>
                <div className='w-full h-full backdrop-blur-3xl -z-10 absolute top-0 left-0' />

                {/* About */}
                <MyElement name="about">
                    <section className='flex flex-col sm:grid sm:grid-cols-[auto_1fr] gap-4'>
                        <SectionTitle className='col-span-2'>
                            <h2 style={{
                                gridColumn: '1/3',
                                gridRow: '1/2',
                                marginInlineEnd: -20
                            }} className='text-2xl sm:text-4xl pb-4'>About</h2>
                        </SectionTitle>

                        <div style={{
                            gridColumn: '2/3',
                            gridRow: '2/3',
                        }} className={'text-xl sm:text-3xl text-justify [&>p]:mb-4 mt-2 sm:mt-10 ' + ubuntu.className}>
                            <p>&nbsp;&nbsp;My name is Abdelkarim, A <span className='text-linear-color'>fullstack web developer</span> and a seasoned <span className='text-linear-color'>Software engineer</span> with over <span className='text-linear-color font-bold'>8 years</span> of experience.</p>
                            <p>&nbsp;&nbsp;My <span className='text-linear-color'>passion</span> for development has been growing ever since I made my first <span className="text-linear-color">hello world</span>, I love to <span className='text-linear-color'>engage</span> and <span className='text-linear-color'>commit</span> myself to projects that have an impact.</p>
                            <p>&nbsp;&nbsp;I am always looking for new <span className='text-linear-color'>challenges</span> and <span className='text-linear-color'>opportunities</span> to learn and grow as a <span className='text-linear-color'>developer</span> and as a <span className='text-linear-color'>team player</span>.</p>
                        </div>
                    </section>
                </MyElement>

                {/* Achievements */}
                <MyElement name="achievements">
                    <section className='flex flex-col gap-4 mt-4 sm:mt-10'>
                        <SectionTitle>
                            <h2 className='text-2xl sm:text-4xl pb-4'>Achievements</h2>
                        </SectionTitle>

                        <div className='flex gap-4 sm:gap-10 flex-wrap place-content-center mt-4 sm:mt-10'>
                            {achievements.map(({ title, number, subtitle }, i) =>
                                <div key={i} style={{ marginRight: '1rem', width: 400 }} className='flex h-full flex-col bg-gold-tw bg-opacity-5 rounded-lg p-10 hover:scale-110 hover:rotate-6 hover:bg-opacity-10 transition-all'>

                                    <div key={i} className='flex flex-col items-start pb-3'>
                                        <span className={'text-5xl ' + saira.className}>{number}</span>
                                        <span className='text-3xl font-bold text-linear-color'>{title}</span>
                                    </div>

                                    <p className={'text-xl ' + ubuntu.className}>
                                        {subtitle}
                                    </p>

                                </div>
                            )}
                        </div>

                    </section>
                </MyElement>

                {/* Education
                <MyElement name="education">
                    <section>
                        <SectionTitle>
                            <h2 className={'text-2xl sm:text-4xl pb-4'}>Education</h2>
                        </SectionTitle>

                        <div className="flex md:p-10 gap-4 sm:gap-10 items-center flex-col justify-center md:flex-row ">
                            <ClientLottie animationData={data} width={400} style={{
                                minWidth: 400
                            }} />
                            <div className='flex gap-5 flex-col'>
                                {educations.map(({ title, date, location, subtitle }, index) => (
                                    <div key={index} className='flex flex-col p-5 flex-wrap items-center gap-4 rounded-2xl bg-white bg-opacity-5'>
                                        <p className='text-lg text-nowrap font-light text-linear-color'>{date}</p>

                                        <h3 className='text-3xl mb-0 text-center'>
                                            {title}
                                            <p className='!text-lg text-nowrap p-0 m-0 font-light text-linear-color'>{subtitle}</p>
                                        </h3>

                                        <h3 className='text-2xl text-center font-light'>{location}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </section>
                </MyElement> */}

                {/* Skills */}
                <MyElement name="skills">
                    <section className='flex flex-col gap-4 mt-4 sm:mt-10'>
                        <SectionTitle>
                            <h2 className='text-2xl sm:text-4xl pb-4'>Skills</h2>
                        </SectionTitle>

                        <div className='flex gap-4 sm:gap-10 flex-wrap content-center place-content-center mt-4 sm:mt-10'>
                            {skills.map(({ description, icon, name }, i) =>
                                <div key={i} style={{ marginRight: '1rem', width: 300 }} className='text-justify flex h-full flex-col items-center bg-gold-tw bg-opacity-5 rounded-lg p-10 hover:scale-110 hover:rotate-6 hover:bg-opacity-10 transition-all'>

                                    <div key={i} className='flex flex-col items-center justify-center  w-36 !h-36 max-h-36 pb-3'>
                                        <Image alt='skill' src={'/skills/' + icon} height={100} width={100} className='-m-6' />
                                        <span className='text-2xl text-linear-color'>{name}</span>
                                    </div>

                                    <p className={'text-xl text-center ' + ubuntu.className}>
                                        {description}
                                    </p>

                                </div>
                            )}
                        </div>

                    </section>
                </MyElement>

                {/* Projects */}
                <MyElement name="projects">
                    <section className='mt-10'>
                        <SectionTitle>
                            <h2 className='text-2xl sm:text-4xl pb-4'>Projects</h2>
                        </SectionTitle>

                        <div className='flex flex-col gap-4 sm:gap-10 mt-4 sm:mt-10'>
                            {projects.map(({ description, image, title, stack, url, subtitle }, index) => (

                                <div key={index}
                                    className='flex flex-col gap-4 sm:gap-10 p-7 sm:p-10 items-center center rounded-md sm:rounded-2xl bg-white bg-opacity-5 lg:flex-row'>

                                    <div className='flex flex-col gap-2'>
                                        <h3 className='gap-2 flex items-end flex-wrap'>
                                            <span className='text-3xl'>{title}</span>
                                            <span className='text-xl text-linear-color font-bold'>( {subtitle} )</span>
                                        </h3>
                                        {description.filter((v, i) => i === 0).map((d, i) => <p key={i} className={'text-2xl text-justify ' + ubuntu.className} dangerouslySetInnerHTML={{ __html: '&nbsp;&nbsp;' + d }} />)}
                                    </div>
                                    <div>
                                        {/* <div className='flex items-center gap-2 justify-center m-2'>
                                            {stack.map(s => <StackIcon name={s} key={s} />)}
                                        </div> */}
                                        <a href={url} target='_blank'>
                                            <Image
                                                alt='project image'
                                                src={image}
                                                height={500}
                                                width={1200}
                                                className='object-cover rounded-2xl '
                                                style={{
                                                    objectPosition: '0 0',
                                                }} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </MyElement>

                {/* Testimonials */}
                <MyElement name="testimonials">
                    <section className='mt-10'>
                        <SectionTitle>
                            <h2 className='text-2xl sm:text-4xl pb-4'>Testimonials</h2>
                        </SectionTitle>

                        <div className='flex flex-col gap-4 sm:gap-10 mt-7 sm:mt-10'>
                            {testimonials.map(({ name, country, description, countryCode }, index) => (
                                <div key={index}
                                    className={'flex flex-col sm:grid sm:grid-cols-[auto_auto_auto_auto_1fr] sm:grid-rows-[auto_1fr] items-center gap-2 bg-opacity-5 p-5 sm:p-10 rounded-md' + (index % 2 === 0 ? ' bg-orange-500 flex-row-reverse' : ' bg-indigo-500')}>

                                    <span style={{
                                        height: 2,
                                        marginTop: '1rem'
                                    }} className='block bg-gold w-10 self-start' />

                                    <span className='text-7xl self-start'>&ldquo;</span>

                                    <h3 className='text-3xl self-end'>
                                        <span>{name} </span>
                                        <Tooltip label={country}>
                                            <Image alt='flag' src={`/flags/${countryCode}.svg`} width={20} height={20} className='inline' />
                                        </Tooltip>
                                    </h3>

                                    <p className={'text-2xl row-start-2 col-start-3 col-span-3 text-justify ' + ubuntu.className}>
                                        {description.map((d, i) => <span className='block' key={i} dangerouslySetInnerHTML={{ __html: '&nbsp;&nbsp;' + d }} />)}
                                    </p>

                                </div>
                            ))}

                            <a
                                target='_blank'
                                href='https://mostaql.com/u/abdelkrime2055/reviews'
                                className='text-2xl self-end font-bold cursor-pointer bg-gold text-dark py-2 px-4 rounded hover:bg-gold transition-colors duration-300'
                            >
                                More reviews on Mostaql ....
                            </a>
                        </div>
                    </section>
                </MyElement>

                {/* Reach me */}
                <MyElement name="reach-me">
                    <section
                        className='mt-7 sm:mt-10'
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            gridTemplateRows: '1fr auto 1fr',
                            justifyItems: 'center',
                            alignItems: 'center',
                            columnGap: 10
                        }}>
                        <SectionTitle className='grid items-end col-span-3 col-start-1 grid-cols-subgrid'>
                            <h2 className='text-2xl sm:text-4xl pb-4'>Reach me</h2>
                        </SectionTitle>

                        <div className="flex gap-4 sm:gap-10 col-start-1 col-end-4 mt-7 sm:m-10 flex-wrap items-center justify-center w-full">

                            <div className="grow">
                                <ReachMe />
                            </div>

                            <div className='flex flex-wrap justify-center items-center gap-2 grow max-w-96'>
                                <TransparentButton className='max-w-full' leftSection={<MdEmail size={20} color={gold} />}>
                                    <a href='mailto:abdelkrime.bettayeb@gmail.com' className='text-ellipsis overflow-hidden w-full'>abdelkrime.bettayeb@gmail.com</a>
                                </TransparentButton>
                                <TransparentButton className='max-w-full' leftSection={<FaWhatsapp size={20} color={gold} />}>
                                    <a href='https://wa.me/+213540606959' className='text-ellipsis overflow-hidden w-full'>+213 540 606 959</a>
                                </TransparentButton>
                                <TransparentButton className='max-w-full' leftSection={<MdLocationCity size={20} color={gold} />}>
                                    <a href='https://maps.app.goo.gl/PQ8h3dBKmHihEkR96' className='text-ellipsis overflow-hidden w-full'>Relizane, Algeria</a>
                                </TransparentButton>
                                <TransparentButton className='max-w-full' leftSection={<FaLinkedin size={20} color={gold} />}>
                                    <a href='https://www.linkedin.com/in/karimbettayeb/' className='text-ellipsis overflow-hidden w-full'>LinkedIn</a>
                                </TransparentButton>
                            </div>
                        </div>

                        <span className='w-full bg-gold row-start-3 col-span-3' style={{ height: 5 }} />
                    </section>
                </MyElement>

                {/* Thank you for scrolling */}
                <section className='flex flex-col gap-4 items-center'>
                    <h3>
                        <span className='text-4xl sm:text-7xl'>&ldquo;</span>
                        <span className={saira.className}>
                            <span className='text-linear-color text-4xl sm:text-5xl'> Thanks</span>
                            <span className='text-xl sm:text-2xl'> for scrolling</span>
                        </span>
                        <span className='text-7xl'>&rdquo;</span>
                    </h3>

                    <p className={'text-2xl text-center ' + ubuntu.className}>If you would like to work with me, feel free to <span className='text-linear-color'>reach out !</span></p>

                    <div className='flex gap-4 row-start-3 col-start-2'>
                        <a target='_blank' href='https://facebook.com/mr.a.blizzard/'>
                            <FaFacebook size={20} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                        </a>
                        <a target='_blank' href='https://www.linkedin.com/in/karimbettayeb/'>
                            <FaLinkedin size={20} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                        </a>
                        <a target='_blank' href='https://github.com/xnevz/'>
                            <FaGithub size={20} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                        </a>
                    </div>

                </section>
            </div>
        </>
    );
}
