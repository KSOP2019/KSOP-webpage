import type {MetadataRoute} from 'next'
import {SITE_URL} from '@/lib/site-url'
export default function sitemap():MetadataRoute.Sitemap{return ['','/schedule','/events','/ranking','/news','/media','/about','/partners'].map(p=>({url:SITE_URL+(p||'/'),changeFrequency:'weekly',priority:p?0.8:1}))}
