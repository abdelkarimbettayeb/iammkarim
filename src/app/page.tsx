import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaGithub, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { MdDownload, MdEmail, MdLocationCity } from 'react-icons/md';
import ClientLink from '../components/ClientLink';
import ScrollElement from '../components/Header/MyScrollElement';
import MyCard from '../components/MyCard';
import ReachMe from '../components/ReachMe';
import TypingTitles from '../components/TypingTitles';
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
            description: 'Fullstack code, reducing boilerplate code.'
        },
        {
            name: 'NodeJS',
            icon: 'nodejs.png',
            description: 'Robust backend functionality.'
        },
        {
            name: 'Refine.dev',
            icon: 'refine.png',
            description: 'Admin dashboards degisn.'
        },
        {
            name: 'PostgreSQL',
            icon: 'pgsql.png',
            description: 'Effective data management.'
        },
        {
            name: 'Tailwind',
            icon: 'tailwind.png',
            description: 'Styling UI and responsiveness across devices.'
        },
        {
            name: 'C# .NET',
            icon: 'csharp.png',
            description: 'Used to develop administrative tools.'
        }
    ],
    achievements: [
        {
            title: 'Web Apps',
            number: '10+',
        },
        {
            title: 'Payment Gateways',
            number: '10+',
        },
        {
            title: 'Web Scraping Tools',
            number: '8+',
        },
        {
            title: 'Complex Optimisation Problems',
            number: '10+',
        },
        {
            title: 'Bots (Whatsapp, Telegram, ...)',
            number: '5+',
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
        }
    ],
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
                'We asked Engineer Abdelkarim to work on more than 5 projects, all <span class="text-linear-color">exceeded our expectations</span>.',
                'As opposed to the sophisticated nature of the work, he never gets tired of nor fail to propose <span class="text-linear-color">better</span>, <span class="text-linear-color">easier</span> and <span class="text-linear-color">safer solutions</span>.'
            ],
            image: '/testimonials/john.jpg'
        },
        {
            name: 'Hani I.',
            country: 'Saudi Arabia',
            countryCode: 'sa',
            description: [
                'His dedication to the work is evident, characterized by sincerity and meticulous <span class="text-linear-color">attention to detail</span>.',
                'I express my heartfelt wishes for their continued success in all endeavors. 💚'
            ]
        },
        {
            name: 'Khaled A.',
            country: 'Yemen',
            countryCode: 'ye',
            description: [
                'Abdelkarim <span class="text-linear-color">exemplifies excellence</span> as a <span class="text-linear-color">first-class programmer</span>.',
                'Our collaboration on numerous projects has been exceedingly fruitful.'
            ]
        }
    ]
};

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
                        <p className={'text-3xl sm:text-4xl typewriter text-wrap self-end ' + ubuntu.className} ><TypingTitles /></p>

                        <div className='flex gap-5 flex-wrap justify-end self-end items-center'>

                            <Link target='blank' href='/Resume.pdf'>
                                <Button
                                    className='h-max p-3 px-6 bg-blue-500 hover:bg-blue-500/50 text-white shadow-lg shadow-gray-400/50 dark:shadow-gray-800/50'
                                    size='lg'>
                                    <span className='flex gap-2 items-center'>
                                        <MdDownload className='!h-max !w-max' size={30} />
                                        <span className='text-2xl font-bold'>RESUME</span>
                                    </span>
                                </Button>
                            </Link>

                            <ClientLink spy smooth offset={-50} containerId='scrollContainer' to='reach-me'>
                                <Button
                                    size='lg'
                                    className='h-max p-3 px-6 bg-blue-500 hover:bg-blue-500/50 text-white shadow-lg shadow-gray-400/50 dark:shadow-gray-800/50'>
                                    <span className='text-2xl tracking-[0.5px] font-bold'>REACH OUT</span>
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
                            <Link rel='noopener' title='facebook' target='_blank' href='https://facebook.com/mr.a.blizzard/'>
                                <FaFacebook size={30} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                            </Link>
                            <Link rel='noopener' title='linkedin' target='_blank' href='https://www.linkedin.com/in/karimbettayeb/'>
                                <FaLinkedin size={30} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                            </Link>
                            <Link rel='noopener' title='github' target='_blank' href='https://github.com/xnevz/'>
                                <FaGithub size={30} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className='-m-5 sm:-m-10 ps-5 pe-5 sm:ps-10 sm:pe-10 relative pb-10 flex flex-col gap-10'>
                <div className='w-full h-full backdrop-blur-3xl -z-10 absolute top-0 left-0' />

                {/* About */}
                <ScrollElement name="about">
                    <MyCard title='Who am i?' className='flex ms-56 flex-col gap-5 sm:text-2xl'>
                        <p>
                            I&apos;m Abdelkarim, a
                            <span className='text-linear-color'> full-stack web developer</span> and
                            an experienced software engineer with
                            over <span className='text-linear-color font-bold'>7 years</span> of hands-on experience.
                        </p>

                        {/*
                        <p>
                            My <span className='text-linear-color'>passion</span> for development began with a simple
                            <span className="text-linear-color">Hello, world!</span> and has only grown since.
                            I thrive on building <span className='text-linear-color'> impactful</span> products and
                            contributing to projects that matter.
                        </p> */}

                        <p>
                            I&apos;m always seeking new <span className='text-linear-color'>challenges</span> and
                            <span className='text-linear-color'> opportunities</span> to grow — both as a
                            <span className='text-linear-color'> developer</span> and a
                            <span className='text-linear-color'> collaborator</span>.
                        </p>
                    </MyCard>
                </ScrollElement>

                {/* Achievements */}
                <ScrollElement name="achievements">
                    <MyCard flip title='Achievements'>
                        <div className='flex gap-4 sm:gap-10 flex-wrap place-content-center'>
                            {achievements.map(({ title, number }, i) =>
                                <div
                                    key={i}
                                    className='flex h-full flex-col bg-gold-tw bg-opacity-5 rounded-lg p-4 sm:p-10 hover:scale-110 hover:rotate-6 hover:bg-opacity-10 transition-all'>

                                    <div key={i} className='flex flex-col items-start'>
                                        <span className={'text-3xl sm:text-5xl ' + saira.className}>{number}</span>
                                        <span className='text-xl sm:text-3xl font-bold text-start text-linear-color'>{title}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </MyCard>
                </ScrollElement>

                {/* Skills */}
                <ScrollElement name="skills">
                    <MyCard title='Skills'>

                        <div className='flex gap-4 sm:gap-10 flex-wrap items-stretch place-content-center'>
                            {skills.map(({ description, icon, name }, i) =>
                                <div
                                    key={i}
                                    style={{ maxWidth: 250, width: 'max-content' }}
                                    className='text-justify flex flex-col items-center bg-gold-tw bg-opacity-5 rounded-lg p-4 sm:p-10 hover:scale-110 hover:rotate-6 hover:bg-opacity-10 transition-all'>

                                    <div key={i} className='flex flex-col items-center justify-center w-20 sm:w-36 sm:pb-3'>
                                        <Image alt='skill' src={'/skills/' + icon} height={100} width={100} className='-m-6' />
                                        <span className='text-xl sm:text-2xl text-linear-color'>{name}</span>
                                    </div>

                                    <p className={'text-md sm:text-xl text-center ' + ubuntu.className}>
                                        {description}
                                    </p>

                                </div>
                            )}
                        </div>

                    </MyCard>
                </ScrollElement>

                {/* Projects */}
                <ScrollElement name="projects">
                    <MyCard title={'Projects'}>

                        <div className='flex flex-col gap-4 sm:gap-10 mt-4 sm:mt-10'>
                            {projects.map(({ description, image, title, stack, url, subtitle }, index) => (

                                <div key={index}
                                    className='flex flex-col gap-4 sm:gap-10 p-5 sm:p-10 items-center center rounded-md sm:rounded-2xl bg-white bg-opacity-5 '>

                                    <div className='flex flex-col gap-2'>
                                        <h3 className='gap-2 flex items-end flex-wrap'>
                                            <span className='text-xl sm:text-3xl'>{title}</span>
                                            <span className='text-md sm:text-xl text-linear-color font-bold'>( {subtitle} )</span>
                                        </h3>
                                        {/* {description.filter((v, i) => i === 0).map((d, i) => <p key={i} className={'text-2xl text-justify ' + ubuntu.className} dangerouslySetInnerHTML={{ __html: '&nbsp;&nbsp;' + d }} />)} */}
                                    </div>
                                    <div>
                                        {/* <div className='flex items-center gap-2 justify-center m-2'>
                                            {stack.map(s => <StackIcon name={s} key={s} />)}
                                        </div> */}
                                        <Link href={url} target='_blank'>
                                            <Image
                                                alt='project image'
                                                src={image}
                                                height={500}
                                                width={1200}
                                                className='object-cover rounded-2xl '
                                                style={{
                                                    objectPosition: '0 0',
                                                }} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </MyCard>
                </ScrollElement>

                {/* Testimonials */}
                <ScrollElement name="testimonials">
                    <MyCard title={'Testimonials'}>

                        <div className='flex flex-col gap-4 sm:gap-10 sm:mt-10'>
                            {testimonials.map(({ name, country, description, countryCode }, index) => (
                                <div key={index}
                                    className={'flex flex-col sm:grid sm:grid-cols-[auto_auto_auto_auto_1fr] sm:grid-rows-[auto_1fr] items-center gap-2 bg-opacity-5 p-5 sm:p-10 rounded-md' + (index % 2 === 0 ? ' bg-orange-500 flex-row-reverse' : ' bg-indigo-500')}>

                                    <span style={{
                                        height: 2
                                    }} className='block mt-1 sm:mt-5 bg-gold w-10 self-start' />

                                    <span className='text-4xl sm:text-7xl self-start'>&ldquo;</span>

                                    <h3 className='text-2xl sm:text-3xl self-end'>
                                        <span>{name} </span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Image alt='flag' src={`/flags/${countryCode}.svg`} width={20} height={20} className='inline' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {country}
                                            </TooltipContent>
                                        </Tooltip>
                                    </h3>

                                    <p className={'flex flex-col gap-5 text-md sm:text-2xl row-start-2 col-start-3 col-span-3 text-justify ' + ubuntu.className}>
                                        {description.map((d, i) => <span className='block' key={i} dangerouslySetInnerHTML={{ __html: d }} />)}
                                    </p>

                                </div>
                            ))}

                            <Link
                                rel='noopener'
                                title='reviews'
                                target='_blank'
                                href='https://mostaql.com/u/abdelkrime2055/reviews'
                                className='text-md sm:text-2xl self-end font-bold cursor-pointer bg-gold text-dark py-2 px-4 rounded hover:bg-gold transition-colors duration-300'
                            >
                                More reviews on Mostaql ....
                            </Link>
                        </div>
                    </MyCard>
                </ScrollElement>

                {/* Reach me */}
                <ScrollElement name="reach-me">
                    <MyCard title={'Reach out !'}>


                        <div className="flex gap-4 sm:gap-10 col-start-1 col-end-4 flex-wrap items-center justify-center w-full">

                            <div className="grow">
                                <ReachMe />
                            </div>

                            <div className='flex flex-wrap [&_*]:text-sm sm:[&_*]:text-md justify-center items-center gap-2 grow max-w-96'>
                                <Button>
                                    <MdEmail size={20} color={gold} />
                                    <Link href='mailto:bettayebabdelkrime2055@gmail.com' className='text-ellipsis overflow-hidden w-full'>bettayebabdelkrime2055@gmail.com</Link>
                                </Button>
                                <Button>
                                    <FaWhatsapp size={35} className='text-yellow-600 dark:text-yellow-200' />
                                    <Link href='https://wa.me/+213540606959' className='text-ellipsis overflow-hidden w-full'>+213 540 606 959</Link>
                                </Button>
                                <Button>
                                    <MdLocationCity size={20} color={gold} />
                                    <Link href='https://maps.app.goo.gl/PQ8h3dBKmHihEkR96' className='text-ellipsis overflow-hidden w-full'>Relizane, Algeria</Link>
                                </Button>
                                <Button>
                                    <FaLinkedin size={20} color={gold} />
                                    <Link href='https://www.linkedin.com/in/karimbettayeb/' className='text-ellipsis overflow-hidden w-full'>LinkedIn</Link>
                                </Button>
                            </div>
                        </div>

                    </MyCard>
                </ScrollElement>

                <section className='flex flex-col gap-4 items-center'>
                    <p className={'text-2xl text-center ' + ubuntu.className}>Don&apos;t hesitate to <span className='text-linear-color font-bold'>reach out !</span> I reply fast !</p>

                    <div className='flex gap-4 row-start-3 col-start-2'>
                        <Link rel='noopener' title='facebook' target='_blank' href='https://facebook.com/mr.a.blizzard/'>
                            <FaFacebook size={20} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                        </Link>
                        <Link rel='noopener' title='linkedin' target='_blank' href='https://www.linkedin.com/in/karimbettayeb/'>
                            <FaLinkedin size={20} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                        </Link>
                        <Link rel='noopener' title='github' target='_blank' href='https://github.com/xnevz/'>
                            <FaGithub size={20} className='opacity-80 hover:opacity-100 transition-all hover:scale-105' />
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
