import { Button, ButtonProps } from "./ui/button";

export function TransparentButton(props: ButtonProps) {
    return <Button
        {...props}
        className={'text-xl items-center flex bg-opacity-5 rounded-md h-max border-none text-muted-foreground p-3 ' + props.className} />;
}
