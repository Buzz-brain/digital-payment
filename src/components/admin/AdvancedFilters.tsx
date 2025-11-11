import { useState } from 'react';
import { Filter, Save, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: Record<string, any>) => void;
  filterConfig: {
    label: string;
    key: string;
    type: 'text' | 'select' | 'date' | 'daterange';
    options?: { value: string; label: string }[];
  }[];
}

export const AdvancedFilters = ({ onFilterChange, filterConfig }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const { toast } = useToast();

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a preset name',
        variant: 'destructive',
      });
      return;
    }

    const preset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName,
      filters: { ...filters },
    };

    const newPresets = [...presets, preset];
    setPresets(newPresets);
    localStorage.setItem('filter_presets', JSON.stringify(newPresets));
    
    toast({
      title: 'Success',
      description: `Filter preset "${presetName}" saved`,
    });
    
    setPresetName('');
  };

  const loadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    onFilterChange(preset.filters);
    
    toast({
      title: 'Success',
      description: `Loaded preset "${preset.name}"`,
    });
  };

  const deletePreset = (presetId: string) => {
    const newPresets = presets.filter(p => p.id !== presetId);
    setPresets(newPresets);
    localStorage.setItem('filter_presets', JSON.stringify(newPresets));
    
    toast({
      title: 'Success',
      description: 'Filter preset deleted',
    });
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
    
    toast({
      title: 'Success',
      description: 'All filters cleared',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Apply multiple filters and save presets for quick access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filter Controls */}
          <div className="grid grid-cols-2 gap-4">
            {filterConfig.map((config) => (
              <div key={config.key} className="space-y-2">
                <Label>{config.label}</Label>
                {config.type === 'text' && (
                  <Input
                    placeholder={`Enter ${config.label.toLowerCase()}`}
                    value={filters[config.key] || ''}
                    onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  />
                )}
                {config.type === 'select' && config.options && (
                  <Select
                    value={filters[config.key] || ''}
                    onValueChange={(value) => handleFilterChange(config.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {config.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {config.type === 'date' && (
                  <Input
                    type="date"
                    value={filters[config.key] || ''}
                    onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  />
                )}
                {config.type === 'daterange' && (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      placeholder="From"
                      value={filters[`${config.key}_from`] || ''}
                      onChange={(e) => handleFilterChange(`${config.key}_from`, e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={filters[`${config.key}_to`] || ''}
                      onChange={(e) => handleFilterChange(`${config.key}_to`, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save Preset */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-medium">Save Current Filters</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <Button onClick={savePreset} className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          {/* Saved Presets */}
          {presets.length > 0 && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="text-sm font-medium">Saved Presets</h4>
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="text-sm font-medium">{preset.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadPreset(preset)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePreset(preset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
