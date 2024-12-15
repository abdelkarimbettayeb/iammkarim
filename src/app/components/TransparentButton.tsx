import { Button, ButtonProps, PolymorphicComponentProps } from "@mantine/core";

export function TransparentButton(props: PolymorphicComponentProps<'button', ButtonProps>) {
    return <Button
        {...props}
        className={'bg-white text-lg items-center flex bg-opacity-5 rounded-md h-max border-none text-white p-3 ' + props.className} />;
}
