'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const loginSchema = z.object({
    email: z.string().email("Invalid email address."),
    password: z.string().min(1, "Password is required."),
});
type LoginValues = z.infer<typeof loginSchema>;


const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(10, "Phone number must be at least 10 digits."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});
type RegisterValues = z.infer<typeof registerSchema>;


function Logo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-10 w-10" fill="currentColor" >
      <path d="M83.8,62.8c-0.2-13.3-10.4-24.1-23.3-25.1c-2-8.3-9-14.7-17.7-14.7c-9.2,0-16.9,6.7-18.1,15.7C15.4,40.1,7.2,49,7.2,59.6c0,11.2,9.1,20.3,20.3,20.3h36.1C75,79.9,84,72.4,83.8,62.8z" className="text-foreground/80"/>
      <g className="text-primary">
        <path d="M51,68.9c-4.4,0-8-3.6-8-8V47.3c0-4.4,3.6-8,8-8s8,3.6,8,8v13.6C59,65.3,55.4,68.9,51,68.9z"/>
        <path d="M48,49h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M48,55h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M48,61h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M51,68.9v5.8c0,2.6-2.1,4.7-4.7,4.7h-0.6c-2.6,0-4.7-2.1-4.7-4.7v-5.8" stroke="currentColor" strokeWidth="3" fill="none"/>
        <rect x="44" y="79" width="14" height="4" rx="2" />
      </g>
    </svg>
  );
}

export default function UserLoginPageClient() {
  const { login, registerUser } = useAuth();
  
  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: ''}});
  const registerForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', phone: '', password: ''}});

  const onLoginSubmit: SubmitHandler<LoginValues> = (data) => {
    login(data.email, data.password);
  };
  
  const onRegisterSubmit: SubmitHandler<RegisterValues> = (data) => {
    registerUser(data.name, data.email, data.phone, data.password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
                <Logo />
                <CardTitle className="text-3xl font-headline">CloudStage</CardTitle>
            </div>
          <CardDescription>Login or create an account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                     <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 pt-4">
                            <FormField control={loginForm.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={loginForm.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>Login</Button>
                        </form>
                     </Form>
                </TabsContent>
                <TabsContent value="register">
                    <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 pt-4">
                             <FormField control={registerForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={registerForm.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={registerForm.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={registerForm.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>Register</Button>
                        </form>
                     </Form>
                </TabsContent>
            </Tabs>
             <div className="mt-4 text-center text-sm">
              Are you an artist?{' '}
              <Link href="/login" className="underline hover:text-primary">
                Login here
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
