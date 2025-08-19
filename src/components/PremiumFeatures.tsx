import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Star, Zap, Target, Users, TrendingUp, Lock, CheckCircle } from "lucide-react";
import { useState } from "react";

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  savings?: number;
}

const premiumPlans: PremiumPlan[] = [
  {
    id: 'basic',
    name: 'Basic Fan',
    price: 4.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Ad-free experience',
      'Advanced match statistics',
      'Priority customer support',
      'Exclusive content access',
      'Early access to features'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Fan',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    popular: true,
    features: [
      'All Basic features',
      'Live match commentary',
      'Advanced betting insights',
      'Personalized predictions',
      'VIP community access',
      'Exclusive merchandise discounts'
    ]
  },
  {
    id: 'ultimate',
    name: 'Ultimate Fan',
    price: 19.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'All Premium features',
      '1-on-1 expert consultations',
      'Custom betting strategies',
      'Exclusive event access',
      'Priority ticket sales',
      'Dedicated account manager'
    ]
  }
];

const yearlyPlans = premiumPlans.map(plan => ({
  ...plan,
  price: plan.price * 10, // 2 months free
  interval: 'yearly' as const,
  savings: 20
}));

export function PremiumFeatures() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');

  const plans = billingInterval === 'monthly' ? premiumPlans : yearlyPlans;

  const handleSubscribe = (planId: string) => {
    // Implement subscription logic
    console.log(`Subscribing to ${planId} plan`);
    // Redirect to payment processor or show payment modal
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Premium Features</h1>
              <p className="text-xl text-muted-foreground">Unlock the ultimate football experience</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get exclusive access to advanced analytics, live commentary, and personalized insights. 
            Join thousands of premium fans who never miss a moment.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center">
          <div className="bg-muted rounded-lg p-1 flex items-center gap-2">
            <Button
              variant={billingInterval === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingInterval('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={billingInterval === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingInterval('yearly')}
            >
              Yearly
              {billingInterval === 'yearly' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Save 20%
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-primary">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{plan.interval === 'monthly' ? 'mo' : 'year'}
                    </span>
                  </div>
                  {plan.savings && (
                    <Badge variant="secondary" className="text-xs">
                      Save ${plan.savings}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-primary hover:bg-gradient-accent' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Current Plan' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="bg-gradient-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              What You Get with Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Deep dive into team performance, player statistics, and historical data
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Live Commentary</h3>
                <p className="text-sm text-muted-foreground">
                  Expert analysis and real-time insights during live matches
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">VIP Community</h3>
                <p className="text-sm text-muted-foreground">
                  Exclusive access to premium forums and expert discussions
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Instant Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Get alerts for goals, cards, and key match events
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Ad-Free Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Enjoy uninterrupted football content without advertisements
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Exclusive Content</h3>
                <p className="text-sm text-muted-foreground">
                  Access to premium articles, interviews, and behind-the-scenes content
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border-b border-border pb-4">
                <h4 className="font-semibold mb-2">Can I cancel my subscription anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
                </p>
              </div>
              
              <div className="border-b border-border pb-4">
                <h4 className="font-semibold mb-2">Is there a free trial available?</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 7-day free trial for all premium plans. No credit card required to start your trial.
                </p>
              </div>
              
              <div className="border-b border-border pb-4">
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, PayPal, and mobile money payments for Kenyan users.
                </p>
              </div>
              
              <div className="pb-4">
                <h4 className="font-semibold mb-2">Do you offer family plans?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! Contact our support team for custom family plan pricing and features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <div className="bg-gradient-primary rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Upgrade?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of premium fans and never miss a moment of the beautiful game.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Crown className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PremiumFeatures;
