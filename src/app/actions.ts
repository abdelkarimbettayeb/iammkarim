"use server";
import { createTransport } from "nodemailer";
import z, { ZodIssue } from "zod";
const findErrors = (fieldName: string, errors: ZodIssue[]) => {
    return errors
        .filter((item) => {
            return item.path.includes(fieldName);
        })
        .map((item) => item.message);
};

interface Errors {
    name: string[];
    email: string[];
    message: string[];
}

interface Data {
    name: string;
    email: string;
    message: string;
}

export async function sendEmail(prevState: any, data: Data): Promise<Errors | undefined> {
    // use zod to validate the data
    const schema = z.object({
        name: z.string().min(3),
        email: z.string().email(),
        message: z.string().optional()
    });

    const result = schema.safeParse(data);

    if (!result.success) {
        const issues: Errors = {
            name: [],
            email: [],
            message: [],
        };

        for (const issue of result.error.issues)
            if (issue.path.includes('name'))
                issues.name.push(issue.message);
            else if (issue.path.includes('email'))
                issues.email.push(issue.message);
            else if (issue.path.includes('message'))
                issues.message.push(issue.message);

        return issues;
    } else {
        // send the email
        const tr = createTransport({
            host: 'mail.privateemail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.PASSWORD
            }
        });

        const result = await tr.sendMail({
            from: process.env.EMAIL_SENDER,
            to: process.env.EMAIL_RECIPIENT,
            subject: `${data.name} is trying to reach out from your portfolio`,
            text: `${data.name} is trying to reach out from your portfolio. Here is the message: ${data.message}. You can reach out to them at ${data.email}`
        });

        await tr.sendMail({
            from: process.env.EMAIL_SENDER,
            to: data.email,
            subject: `Thank you for reaching out to me`,
            text: `Thank you for reaching out to me. I will get back to you as soon as possible.`
        })

        return undefined;
    }
}