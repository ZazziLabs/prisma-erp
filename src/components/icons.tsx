export function Logo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            width="1em"
            height="1em"
            {...props}
        >
            <path
                fill="currentColor"
                d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z"
            />
            <path
                fill="currentColor"
                d="m168 96l-80 64h48a32 32 0 0 0 32-32Z"
                opacity={0.3}
            />
            <path
                fill="currentColor"
                d="M168 96a40 40 0 0 0-40-40H88v16h40a24 24 0 0 1 24 24v40h16Z"
            />
        </svg>
    );
}
