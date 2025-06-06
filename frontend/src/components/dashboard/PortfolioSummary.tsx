import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Portfolio } from '../../types/finance';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

const PortfolioSummary = ({ portfolio }: PortfolioSummaryProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  const initialLoadComplete = useRef(false);
  
  useEffect(() => {
    if (!initialLoadComplete.current) {
      console.log("Starting initial animation");
      
      setDisplayValue(0);
      
      const animationDuration = 1500;
      const steps = 30;
      const increment = portfolio.totalValue / steps;
      const timeout = animationDuration / steps;
      
      let currentStep = 0;
      
      const intervalId = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(portfolio.totalValue);
          clearInterval(intervalId);
        } else {
          setDisplayValue(prev => Math.min(prev + increment, portfolio.totalValue));
        }
      }, timeout);
      
      initialLoadComplete.current = true;
      
      return () => clearInterval(intervalId);
    } else {
      setDisplayValue(portfolio.totalValue);
    }
  }, [portfolio.totalValue]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const renderTrendIcon = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="h-4 w-4 text-finance-positive" />;
    } else if (value < 0) {
      return <TrendingDown className="h-4 w-4 text-finance-negative" />;
    } else {
      return null;
    }
  };
  
  const renderChangeText = (value: number, percentage: number) => {
    const color = value > 0 ? 'text-finance-positive' : value < 0 ? 'text-finance-negative' : 'text-finance-neutral';
    const sign = value > 0 ? '+' : '';
    
    return (
      <span className={`text-sm font-medium ${color} flex items-center gap-1`}>
        {renderTrendIcon(value)}
        {sign}{formatCurrency(value)} ({sign}{percentage.toFixed(2)}%)
      </span>
    );
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Portfolio Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(displayValue)}</div>
          <div className="flex items-center pt-1">
            {renderChangeText(portfolio.dailyChange, portfolio.dailyChangePercent)}
            <span className="text-xs text-muted-foreground ml-2">today</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Daily Performance
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">
              {portfolio.dailyChangePercent > 0 ? '+' : ''}
              {portfolio.dailyChangePercent.toFixed(2)}%
            </div>
            {renderTrendIcon(portfolio.dailyChangePercent)}
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            {formatCurrency(portfolio.dailyChange)} change today
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Weekly Performance
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">
              {portfolio.weeklyChangePercent > 0 ? '+' : ''}
              {portfolio.weeklyChangePercent.toFixed(2)}%
            </div>
            {renderTrendIcon(portfolio.weeklyChangePercent)}
          </div>
          <div className="text-xs text-muted-foreground pt-1">
            {formatCurrency(portfolio.weeklyChange)} change this week
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Available Cash
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(portfolio.cash)}</div>
          <div className="text-xs text-muted-foreground pt-1">
            Ready to invest
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
