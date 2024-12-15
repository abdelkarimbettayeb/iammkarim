"use client";
import { sendEmail } from '@/app/actions';
import { Box, Button, TextInput, Textarea } from '@mantine/core';
import { Form, hasLength, isEmail, useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';

export default function ReachMe() {

    const [error, formAction] = useFormState(sendEmail, { email: [], message: [], name: [] });

    const form = useForm({
        initialValues: {
            name: '',
            email: '',
            message: ''
        },
        validate: {
            name: hasLength({ min: 3 }, 'Name must be at least 3 characters long'),
            email: isEmail('Invalid email address')
        },
        onValuesChange(values, previous) {
            form.clearErrors();
        }
    });

    useEffect(() => {
        if (error === undefined) {
            form.reset();
        }
    }, [error, form]);

    return (
        <Box className='p-5 rounded-md' bg='#fff1'>
            <h4 className='text-3xl font-bold'>Let&apos;s work together !</h4>
            <h6 className='text-xl opacity-70'>I&apos;ll be happy to hear from you.</h6>
            {error !== undefined &&
                <Form
                    form={form}
                    onSubmit={formAction}
                    className='mt-5 flex flex-col gap-4'>

                    <TextInput
                        name='name'
                        label='Full name'
                        variant='filled'
                        placeholder='John Smith'
                        p={4}
                        bg='#fff1'
                        error={error?.name.join(',')}
                        size='lg'
                        className='rounded-md'
                        type='text'
                        key={form.key('name')}
                        {...form.getInputProps('name')}
                    />

                    <TextInput
                        name='email'
                        label="Email address"
                        placeholder='john.smith@gmail.com'
                        variant='filled'
                        size='lg'
                        className='rounded-md'
                        error={error?.email.join(',')}
                        bg='#fff1' p={4}
                        type='email'
                        key={form.key('email')}
                        {...form.getInputProps('email')} />

                    <Textarea
                        name='message'
                        bg='#fff1'
                        variant='filled'
                        size='lg'
                        label='What interests you ?'
                        placeholder='Talk to me!'
                        error={error?.message.join(',')}
                        className='rounded-md'
                        p={4}
                        key={form.key('message')}
                        {...form.getInputProps('message')} />
                    <Button className='self-end' type='submit'>Send</Button>
                </Form>}
            {error === undefined && <h6 className='text-2xl font-bold opacity-70 text-green-200'>Thank you for reaching out, I got your message, I&apos;ll be in touch !</h6>}
        </Box >
    );
}
