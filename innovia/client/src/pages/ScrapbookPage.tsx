import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sticker, STICKER_CATALOG, StickerName } from '../stickers/Sticker';
import { WashiTape } from '../components/common/WashiTape';
import { PageFlipLoader3D } from '../3d/PageFlipLoader3D';
import { triggerConfetti } from '../lib/utils';
import { DndContext, useDraggable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Save, Plus, Trash2, RotateCw, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import { ScrapbookItem } from '@innovia/shared';

interface CanvasItem {
  id: string;
  stickerId: string;
  stickerType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  noteText?: string;
  color?: string;
  zIndex: number;
}

function DraggableStickerNode({
  item,
  isSelected,
  onSelect,
  onRotate,
  onDelete,
  onTextChange,
}: {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onRotate: () => void;
  onDelete: () => void;
  onTextChange: (text: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const currentX = item.x + (transform ? transform.x : 0);
  const currentY = item.y + (transform ? transform.y : 0);

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: `${currentX}px`,
        top: `${currentY}px`,
        zIndex: item.zIndex + (isSelected ? 50 : 0),
        transform: `rotate(${item.rotation}deg)`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group select-none cursor-move transition-shadow ${
        isSelected ? 'ring-2 ring-lavender-dark rounded-xl' : ''
      }`}
    >
      <div {...listeners} {...attributes} className="relative flex flex-col items-center">
        <Sticker name={item.stickerType} size={item.width} />

        {item.noteText !== undefined && (
          <div
            style={{ backgroundColor: item.color || '#FFF9D9' }}
            className="mt-1 px-2.5 py-1 rounded-lg border border-black/10 shadow-sm text-center max-w-[140px]"
          >
            <input
              type="text"
              value={item.noteText}
              onChange={(e) => onTextChange(e.target.value)}
              className="font-handwritten text-xs font-bold text-ink bg-transparent text-center focus:outline-none w-full"
            />
          </div>
        )}
      </div>

      {/* Selected Action Handles */}
      {isSelected && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-paper-lines px-2 py-0.5 rounded-full shadow-sm z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotate();
            }}
            title="Rotate +15 deg"
            className="p-1 hover:bg-paper rounded text-ink"
          >
            <RotateCw className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Remove sticker"
            className="p-1 hover:bg-coral-light rounded text-coral-dark"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

export const ScrapbookPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const { data: savedItems = [], isLoading } = useQuery<ScrapbookItem[]>({
    queryKey: ['scrapbook'],
    queryFn: () => apiRequest('/scrapbook'),
  });

  useEffect(() => {
    if (savedItems.length > 0) {
      setItems(
        savedItems.map((s, idx) => ({
          id: s.id || (s as any)._id || `sticker-${idx}`,
          stickerId: s.stickerId,
          stickerType: s.stickerType,
          x: s.x,
          y: s.y,
          width: s.width || 80,
          height: s.height || 80,
          rotation: s.rotation || 0,
          noteText: s.noteText,
          color: s.color,
          zIndex: s.zIndex || idx + 1,
        }))
      );
    }
  }, [savedItems]);

  const saveMutation = useMutation({
    mutationFn: async (canvasItems: CanvasItem[]) => {
      return apiRequest('/scrapbook/batch', {
        method: 'POST',
        body: JSON.stringify({ items: canvasItems }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapbook'] });
      triggerConfetti();
    },
  });

  const handleDragEnd = (event: any) => {
    const { active, delta } = event;
    if (!delta.x && !delta.y) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === active.id) {
          return {
            ...item,
            x: Math.max(10, item.x + delta.x),
            y: Math.max(10, item.y + delta.y),
          };
        }
        return item;
      })
    );
  };

  const addStickerToCanvas = (stickerName: StickerName) => {
    const newItem: CanvasItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      stickerId: stickerName,
      stickerType: stickerName,
      x: 80 + (items.length % 5) * 60,
      y: 80 + (items.length % 4) * 50,
      width: 75,
      height: 75,
      rotation: Math.floor(Math.random() * 12) - 6,
      zIndex: items.length + 1,
      noteText: 'My Moment ✨',
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
  };

  const rotateItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rotation: (item.rotation + 15) % 360 } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateText = (id: string, text: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, noteText: text } : item))
    );
  };

  if (isLoading) {
    return <PageFlipLoader3D message="Loading your creative scrapbook canvas..." />;
  }

  const categories = ['All', 'Gear', 'Social', 'Finance', 'Time', 'Milestones', 'Moods'];
  const filteredCatalog =
    activeCategory === 'All'
      ? STICKER_CATALOG
      : STICKER_CATALOG.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-handwritten text-4xl sm:text-5xl font-extrabold text-ink">
            Personal Scrapbook & Sticker Playground
          </h1>
          <p className="text-xs sm:text-sm text-ink-light font-body mt-0.5">
            Drag, rotate, customize notes, and curate your creator milestones. Saves directly to your account.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => saveMutation.mutate(items)}
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-ink hover:bg-ink-light text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saveMutation.isPending ? 'Saving...' : 'Save Scrapbook'}</span>
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Interactive Dnd-Kit Scrapbook Canvas */}
        <div
          onClick={() => setSelectedId(null)}
          className="lg:col-span-3 min-h-[580px] bg-journal-dots border-2 border-paper-border rounded-3xl p-6 shadow-scrapbook relative overflow-hidden"
        >
          {/* Top Washi Tape styling */}
          <div className="absolute -top-3.5 left-16 washi-tape washi-tape-pink w-36 h-6 rotate-[-2deg]" />
          <div className="absolute -top-3.5 right-20 washi-tape washi-tape-yellow w-36 h-6 rotate-[2deg]" />

          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {items.map((item) => (
              <DraggableStickerNode
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onSelect={() => setSelectedId(item.id)}
                onRotate={() => rotateItem(item.id)}
                onDelete={() => deleteItem(item.id)}
                onTextChange={(text) => updateText(item.id, text)}
              />
            ))}
          </DndContext>

          {items.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
              <Sticker name="sparkle" size={54} className="mb-3" />
              <p className="font-handwritten text-3xl font-bold text-ink">
                Your Scrapbook Canvas is Clean!
              </p>
              <p className="text-xs text-ink-light max-w-sm mt-1">
                Pick any of the 44 handcrafted creator stickers from the right tray to pin them onto your board.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Sticker Picker Tray */}
        <div className="bg-white border-2 border-paper-border rounded-3xl p-5 shadow-scrapbook flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-paper-lines">
            <h3 className="font-handwritten text-2xl font-bold text-ink">Sticker Library</h3>
            <span className="text-[11px] font-mono text-ink-faint">44 SVG Stickers</span>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-ink text-white'
                    : 'bg-paper text-ink-light hover:bg-paper-lines'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sticker Grid Tray */}
          <div className="grid grid-cols-4 gap-2.5 max-h-[440px] overflow-y-auto p-1">
            {filteredCatalog.map((s) => (
              <button
                key={s.id}
                onClick={() => addStickerToCanvas(s.id)}
                title={s.label}
                className="p-2 rounded-xl bg-paper hover:bg-paper-lines border border-paper-lines flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              >
                <Sticker name={s.id} size={34} />
              </button>
            ))}
          </div>

          <p className="text-[11px] text-ink-faint text-center pt-2 border-t border-paper-lines">
            Click any sticker to stick onto your canvas. Drag to reposition!
          </p>
        </div>
      </div>
    </div>
  );
};
