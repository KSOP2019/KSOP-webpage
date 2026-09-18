import {notFound,redirect} from 'next/navigation'
import {isAdminAuthenticated} from '@/lib/auth'
import {resources} from '@/lib/motion-cms'
import {MotionEditor,MotionSettingsEditor} from '@/components/admin/motion-editor'
export default async function Page({params}:{params:Promise<{resource:string}>}){if(!await isAdminAuthenticated())redirect('/admin/login');const {resource}=await params;if(resource==='settings')return <MotionSettingsEditor/>;if(!resources[resource])notFound();return <MotionEditor resource={resource}/>}
