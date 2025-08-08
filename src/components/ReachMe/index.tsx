"use client";
import { sendEmail } from '@/app/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// Define the form schema using Zod
const formSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    message: z.string()
});

type FormData = z.infer<typeof formSchema>;

export default function ReachMe() {

    const [error, formAction] = useActionState(sendEmail, { email: [], message: [], name: [] });

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            message: ''
        }
    });

    useEffect(() => {
        if (error === undefined) {
            form.reset();
        }
    }, [error, form]);

    const onSubmit = (data: FormData) => {
        // Clear any existing errors
        form.clearErrors();
        // Submit the form using formAction
        formAction(data);
    };

    return (
        <div className='p-2 sm:p-5 rounded-md'>
            <h4 className='text-xl sm:text-3xl font-bold'>Let&apos;s work together !</h4>
            <h6 className='text-md sm:text-xl opacity-70'>I&apos;ll be happy to hear from you.</h6>
            {error !== undefined &&
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='mt-5 flex flex-col gap-4'>

                    <div className='flex flex-col gap-2'>
                        <label htmlFor="name" className='text-sm font-medium'>Full name</label>
                        <Input
                            id="name"
                            placeholder='John Smith'
                            type='text'
                            className={`p-4 rounded-lg bg-background ${error?.name.length || form.formState.errors.name ? 'border-red-500' : ''}`}
                            {...form.register('name')}
                        />
                        {(error?.name.length > 0 || form.formState.errors.name) && (
                            <span className='text-red-500 text-sm'>
                                {error?.name.join(', ') || form.formState.errors.name?.message}
                            </span>
                        )}
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label htmlFor="email" className='text-sm font-medium'>Email address</label>
                        <Input
                            id="email"
                            placeholder='john.smith@gmail.com'
                            type='email'
                            className={`p-4 rounded-lg bg-background ${error?.email.length || form.formState.errors.email ? 'border-red-500' : ''}`}
                            {...form.register('email')}
                        />
                        {(error?.email.length > 0 || form.formState.errors.email) && (
                            <span className='text-red-500 text-sm'>
                                {error?.email.join(', ') || form.formState.errors.email?.message}
                            </span>
                        )}
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label htmlFor="message" className='text-sm font-medium'>Tell me about it</label>
                        <Textarea
                            id="message"
                            placeholder='Talk to me!'
                            className={`p-4 rounded-lg min-h-[120px] bg-background   ${error?.message.length || form.formState.errors.message ? 'border-red-500' : ''}`}
                            {...form.register('message')}
                        />
                        {(error?.message.length > 0 || form.formState.errors.message) && (
                            <span className='text-red-500 text-sm'>
                                {error?.message.join(', ') || form.formState.errors.message?.message}
                            </span>
                        )}
                    </div>

                    <Button size='lg' className='self-end' type='submit'>Send</Button>
                </form>}
            {error === undefined && <h6 className='text-2xl font-bold opacity-70 text-green-200'>Thank you for reaching out, I got your message, I&apos;ll be in touch !</h6>}
        </div>
    );
}
