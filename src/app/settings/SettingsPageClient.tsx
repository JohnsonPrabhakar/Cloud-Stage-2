
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Bell, Languages, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPageClient() {
    const { toast } = useToast();

    return (
        <main className="container py-8 md:py-12 px-4 md:px-6">
             <div className="space-y-4 text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tighter">Settings</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Manage your account preferences, notifications, and more.
                </p>
            </div>
            <Tabs defaultValue="account" className="max-w-2xl mx-auto">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="account"><User className="mr-2"/>Account</TabsTrigger>
                    <TabsTrigger value="notifications"><Bell className="mr-2"/>Notifications</TabsTrigger>
                    <TabsTrigger value="language"><Languages className="mr-2"/>Language</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>Manage your account information and security.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {/* Placeholder for future account settings */}
                           <div className="space-y-2">
                                <Label>Username</Label>
                                <p className="text-sm text-muted-foreground">This is your display name.</p>
                           </div>
                           <div className="space-y-2">
                                <Label>Email</Label>
                                <p className="text-sm text-muted-foreground">Your login email cannot be changed.</p>
                           </div>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                            <h3 className="font-semibold text-destructive">Danger Zone</h3>
                            <p className="text-sm text-muted-foreground">Deleting your account is a permanent action and cannot be undone.</p>
                             <Button variant="destructive" onClick={() => toast({variant: "destructive", title: "Action not implemented."})}>
                                <Trash2 className="mr-2" /> Delete My Account
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="push-notifications">Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive notifications directly on your device.</p>
                                </div>
                                <Switch id="push-notifications" defaultChecked/>
                            </div>
                             <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="email-notifications">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Get emails about new events and recommendations.</p>
                                </div>
                                <Switch id="email-notifications" defaultChecked/>
                            </div>
                             <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                                <div>
                                    <Label htmlFor="promotional-offers">Promotional Offers</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about special offers and discounts.</p>
                                </div>
                                <Switch id="promotional-offers" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="language">
                     <Card>
                        <CardHeader>
                            <CardTitle>Language Settings</CardTitle>
                            <CardDescription>Select your preferred language for the app.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                <Label htmlFor="language-select">Language</Label>
                                <Select defaultValue="en">
                                    <SelectTrigger id="language-select">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">Hindi</SelectItem>
                                        <SelectItem value="ta">Tamil</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    );
}
