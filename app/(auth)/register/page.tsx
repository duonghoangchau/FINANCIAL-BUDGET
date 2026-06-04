import { AuthForm } from '@/components/AuthForm'; import { signUp } from '@/app/actions/auth'
export default function Page({searchParams}:{searchParams:{error?:string}}){return <AuthForm mode="register" action={signUp} error={searchParams.error}/>}
