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

  const steps = [
    // { key: 'template', label: 'Options Templates', icon: Settings },
    { key: 'algorithmic', label: 'Algorithmic', icon: BarChart3 },
    //{ key: 'legs', label: 'Strategy Legs', icon: Plus },
    { key: 'conditions', label: 'Conditions', icon: AlertCircle },
    { key: 'visualization', label: 'Results', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Strategy Builder</h1>
          <p className="text-muted-foreground">Design and test your options trading strategies</p>
        </div>
        
        {/* <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={saveStrategy}>
            <Save className="h-4 w-4 mr-2" />
            Save Strategy
          </Button>
          <Button onClick={deployStrategy} className="bg-gradient-primary">
            <Play className="h-4 w-4 mr-2" />
            Deploy Live
          </Button>
        </div> */}
      </div>

      {/* Strategy Info
      <Card>
        <CardHeader>
          <CardTitle>Strategy Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Strategy Name</Label>
              <Input
                placeholder="Enter strategy name"
                value={strategy.name || ''}
                onChange={(e) => setStrategy({ ...strategy, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Strategy Type</Label>
              <Select
                value={strategy.type}
                onValueChange={(type: any) => setStrategy({ ...strategy, type })}
              >
                <SelectTrigger className="bg-background border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="directional">Directional</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="volatility">Volatility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={strategy.isActive ? 'default' : 'secondary'}>
                  {strategy.isActive ? 'Active' : 'Draft'}
                </Badge>
                {strategy.isActive && (
                  <CheckCircle className="h-4 w-4 text-profit" />
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Label>Description</Label>
            <Input
              placeholder="Describe your strategy"
              value={strategy.description || ''}
              onChange={(e) => setStrategy({ ...strategy, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Step Navigation */}
      <div className="flex space-x-2 overflow-x-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.key;
          const isCompleted = 
            (step.key === 'template') ||
            (step.key === 'legs' && strategy.legs && strategy.legs.length > 0) ||
            (step.key === 'conditions' && strategy.entryConditions && strategy.entryConditions.length > 0);
          
          return (
            <Button
              key={step.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveStep(step.key as any)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4" />
              <span>{step.label}</span>
              {isCompleted && <CheckCircle className="h-3 w-3 text-profit" />}
            </Button>
          );
        })}
      </div>

      {/* Step Content */}
      {activeStep === 'template' && (
       <AlgorithmicStrategies 
          onRunBacktest={handleRunBacktest}
          isLoading={isBacktesting}
        />
      )}

      {activeStep === 'algorithmic' && (
        <AlgorithmicStrategies 
          onRunBacktest={handleRunBacktest}
          isLoading={isBacktesting}
        />
      )}

      {activeStep === 'legs' && (
        <div className="space-y-6">
          {/* Strategy Legs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Strategy Legs ({strategy.legs?.length || 0})</CardTitle>
              <Button onClick={addNewLeg}>
                <Plus className="h-4 w-4 mr-2" />
                Add Leg
              </Button>
            </CardHeader>
            <CardContent>
              {!strategy.legs || strategy.legs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No strategy legs added yet. Click "Add Leg" to start building your strategy.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={strategy.legs.map(leg => leg.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {strategy.legs.map((leg) => (
                        <StrategyLegCard
                          key={leg.id}
                          leg={leg}
                          onRemove={removeLeg}
                          onEdit={editLeg}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  
                  <DragOverlay>
                    {draggedLeg ? (
                      <StrategyLegCard
                        leg={draggedLeg}
                        onRemove={() => {}}
                        onEdit={() => {}}
                        isDragging
                      />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </CardContent>
          </Card>

          {/* Strategy Validation */}
          <StrategyValidation strategy={strategy} />

          {/* Strategy Summary */}
          <StrategySummary strategy={strategy} />

          {/* P&L Visualization */}
          <PnLVisualization legs={strategy.legs || []} />
        </div>
      )}

      {activeStep === 'conditions' && (
        <ConditionsBuilder
          entryConditions={strategy.entryConditions || []}
          exitConditions={strategy.exitConditions || []}
          onUpdateEntryConditions={(conditions) => 
            setStrategy({ ...strategy, entryConditions: conditions })
          }
          onUpdateExitConditions={(conditions) => 
            setStrategy({ ...strategy, exitConditions: conditions })
          }
        />
      )}

      {activeStep === 'visualization' && (
        <>
          {backtestResult ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Backtest Results</h2>
                  <p className="text-muted-foreground">
                    {backtestResult.strategy?.type === 'buy_and_hold' 
                      ? `Buy and Hold strategy on ${backtestResult.strategy?.symbol}` 
                      : `Moving Average Crossover (${backtestResult.strategy?.shortWindow}/${backtestResult.strategy?.longWindow}) on ${backtestResult.strategy?.symbol}`
                    }
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setBacktestResult(null);
                    setActiveStep('algorithmic');
                  }}
                >
                  New Backtest
                </Button>
              </div>

              {/* Strategy Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-profit">
                        {backtestResult.stats.totalReturn.toFixed(2)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Total Return</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {backtestResult.stats.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {backtestResult.stats.maxDrawdown.toFixed(2)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {backtestResult.stats.numTrades}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Trades</div>
                    </div>
                  </div>
                  
                  {/* Strategy-specific insights */}
                  <Separator className="my-4" />
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Strategy Insights</h4>
                    {backtestResult.strategy?.type === 'buy_and_hold' ? (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• This Buy & Hold strategy achieved a {backtestResult.stats.totalReturn > backtestResult.stats.buyHoldReturn ? 'slightly better' : 'similar'} return compared to the benchmark.</p>
                        <p>• Exposure time: {backtestResult.stats.exposureTime.toFixed(1)}% (fully invested strategy)</p>
                        <p>• {backtestResult.stats.sharpeRatio > 1 ? 'Good' : backtestResult.stats.sharpeRatio > 0.5 ? 'Moderate' : 'Poor'} risk-adjusted returns with Sharpe ratio of {backtestResult.stats.sharpeRatio.toFixed(2)}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• MA crossover strategy with {backtestResult.strategy?.shortWindow}/{backtestResult.strategy?.longWindow} day windows generated {backtestResult.stats.numTrades} trades</p>
                        <p>• Win rate: {backtestResult.stats.winRate.toFixed(1)}% ({backtestResult.stats.winRate > 50 ? 'Above average' : 'Below average'} success rate)</p>
                        <p>• Market exposure: {backtestResult.stats.exposureTime.toFixed(1)}% (selective market participation)</p>
                        <p>• {backtestResult.stats.totalReturn > backtestResult.stats.buyHoldReturn ? `Outperformed buy-and-hold by ${(backtestResult.stats.totalReturn - backtestResult.stats.buyHoldReturn).toFixed(2)}%` : `Underperformed buy-and-hold by ${(backtestResult.stats.buyHoldReturn - backtestResult.stats.totalReturn).toFixed(2)}%`}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <BacktestResults result={backtestResult} />
            </div>
          ) : (
            <PnLVisualization legs={strategy.legs || []} />
          )}
        </>
      )}
    </div>
  );
}