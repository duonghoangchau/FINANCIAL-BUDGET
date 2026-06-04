import { AuthForm } from '@/components/AuthForm'; import { signIn } from '@/app/actions/auth'
export default function Page({searchParams}:{searchParams:{error?:string}}){return <AuthForm mode="login" action={signIn} error={searchParams.error}/>}
