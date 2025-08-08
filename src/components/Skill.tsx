import Image from 'next/image';

export default function Skill({ description, icon, index, name }: { name: string, icon: string, description: string, index: number; }) {


    return (
        <div
            className='text-justify flex flex-col items-center bg-gold-tw bg-opacity-5 rounded-lg p-10 hover:scale-110 hover:rotate-6 hover:bg-opacity-10 transition-all'>
            <div key={index} className='flex flex-col items-center justify-center  w-36 h-36 pb-3'>
                <Image alt='skill' src={'/skills/' + icon} height={100} width={100} className='-m-6' />
                <span className='text-2xl text-linear-color'>{name}</span>
            </div>

            <span className='text-xl text-center'>
                {description}
            </span>

        </div>
    );
}