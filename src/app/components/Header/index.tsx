
import { Button } from '@mantine/core';
import { MdMenu } from 'react-icons/md';
import { AppIcon } from '../AppIcon';
import Links from './Links';
import './style.css';
import Sidebar from '../Sidebar';

export default function Header() {

    return (
        <header className='flex items-center p-5 pt-3 pb-3 header absolute top-0 left-0 z-20 bg-white backdrop-blur-md bg-opacity-0 border-b-[1px] border-opacity-5 border-solid border-white'
            style={{
                width: 'calc(100% - 15px)'
            }}
        >
            <AppIcon />
            <Links className='hidden sm:flex ps-5 pe-5 overflow-clip text-lg gap-5 items-center justify-center grow [&_a]:text-sm lg:[&_a]:text-xl' />
            {/* <Searchbar /> */}
        
            <Sidebar />
        </header>
    );
}
