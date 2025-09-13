import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlgorithmicTradingInterface } from '@/components/paper-trading/AlgorithmicTradingInterface';

export default function StrategyBuilder() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchUserAndPortfolio = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;
        
        setUserId(user.id);

        // Fetch user's portfolio
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (portfolioError) throw portfolioError;
        setPortfolio(portfolioData);

        // Fetch user's positions
        const { data: positionsData, error: positionsError } = await supabase
          .from('positions')
          .select('*')
          .eq('portfolio_id', portfolioData.id);

        if (positionsError) throw positionsError;
        setPositions(positionsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserAndPortfolio();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Strategy Builder</h1>
          <p className="text-muted-foreground">Create and deploy algorithmic trading strategies</p>
        </div>
      </div>

      <AlgorithmicTradingInterface 
        portfolio={portfolio}
        userId={userId}
        positions={positions}
      />
    </div>
  );
}