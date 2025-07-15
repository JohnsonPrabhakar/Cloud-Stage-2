
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        features: [
            'Access to free events',
            'Standard quality streaming',
            'Community chat access',
        ],
        isCurrent: true,
        isPopular: false,
    },
    {
        name: 'Premium Monthly',
        price: '₹99',
        period: '/ month',
        features: [
            'Access to all events (free & paid)',
            'HD & 4K streaming quality',
            'Ad-free experience',
            'Download events for offline viewing',
        ],
        isCurrent: false,
        isPopular: true,
    },
     {
        name: 'Premium Yearly',
        price: '₹199',
        period: '/ year',
        features: [
            'All Premium features',
            'Save over 75% with annual billing',
            'Early access to new features',
            'Exclusive member badge',
        ],
        isCurrent: false,
        isPopular: false,
    }
];

export default function SubscriptionsPageClient() {
    const { toast } = useToast();
    const [currentPlan, setCurrentPlan] = useState('Free');

    return (
        <main className="container py-8 md:py-12 px-4 md:px-6">
            <div className="space-y-4 text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tighter">Choose Your Plan</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Unlock the best of CloudStage with a Premium subscription.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <Card key={plan.name} className={cn("flex flex-col", plan.isPopular && "border-primary shadow-lg shadow-primary/20")}>
                        {plan.isPopular && (
                            <div className="bg-primary text-primary-foreground text-center text-sm font-bold py-1 rounded-t-lg">
                                Most Popular
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="font-headline">{plan.name}</CardTitle>
                             <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.period}</span>
                             </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <ul className="space-y-3 text-muted-foreground">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full" 
                                variant={currentPlan === plan.name ? 'secondary' : 'default'}
                                disabled={currentPlan === plan.name}
                                onClick={() => toast({title: "Subscription feature not implemented."})}
                            >
                                {currentPlan === plan.name ? 'Current Plan' : 'Subscribe Now'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
    );
}
