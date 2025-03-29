import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const client = axios.create({
  baseURL: 'https://www.fotmob.com/api/',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  }
});

// Add request interceptor to include x-mas in headers
client.interceptors.request.use(async (config) => {
  config.headers['x-mas'] = await getXmas();
  return config;
});

export async function POST(req: NextRequest) {
  const reqJson = await req.json();
  const res = await client.get(reqJson.url);
  return NextResponse.json(res.data);
}

async function getXmas() {
  // URL found from github: https://github.com/roimee6/fotmob/blob/main/dist/fotmob.js
  // Also this thread: https://www.reddit.com/r/webscraping/comments/1gijgkj/401_on_internal_api/
  const response = await axios.get('http://46.101.91.154:6006/');
  return response.data['x-mas'];
}