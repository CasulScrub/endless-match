/**
 * CollectionGallery Component
 *
 * Modal overlay that displays the player's emoji collection.
 * Shows all 200 emojis in a grid with:
 * - Collected emojis in full color with collection count
 * - Uncollected emojis grayed out
 * - Collection progress statistics
 * - Rarity-based organization/filtering
 *
 * Features:
 * - Scrollable grid of all emojis
 * - Progress bar showing completion %
 * - Stats: total collected, unique count
 * - Close button
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { X } from 'lucide-react';
import { getAllEmojis, EMOJI_POOLS, RARITY_CONFIG } from '../../config/emojiConfig';
import { getCollectionProgress } from '../../utils/collectionStorage';

/**
 * Collection gallery modal component
 *
 * @param {Object} props - Component props
 * @param {Object} props.collection - Collection data object
 * @param {number} props.totalEmojis - Total emojis in game
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @returns {JSX.Element} Collection gallery modal
 */
export const CollectionGallery = ({
  collection,
  totalEmojis,
  isOpen,
  onClose,
}) => {
  /**
   * Selected rarity filter (null = show all)
   */
  const [filterRarity, setFilterRarity] = useState(null);

  // Don't render if not open
  if (!isOpen) return null;

  /**
   * Get all emojis to display
   */
  const allEmojis = getAllEmojis();

  /**
   * Filter emojis by rarity if filter is active
   */
  const displayEmojis = filterRarity
    ? EMOJI_POOLS[filterRarity]
    : allEmojis;

  /**
   * Calculate collection progress
   */
  const progress = getCollectionProgress(collection, totalEmojis);

  /**
   * Check if emoji is collected
   */
  const isCollected = (emoji) => {
    return !!collection.collectedEmojis[emoji];
  };

  /**
   * Get collection count for emoji
   */
  const getCount = (emoji) => {
    return collection.collectedEmojis[emoji]?.timesCollected || 0;
  };

  /**
   * Get rarity counts
   */
  const getRarityCounts = (rarity) => {
    const rarityEmojis = EMOJI_POOLS[rarity];
    const collected = rarityEmojis.filter((emoji) => isCollected(emoji)).length;
    return `${collected}/${rarityEmojis.length}`;
  };

  return (
    <>
      {/* Modal overlay (backdrop) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-800">
              📚 Emoji Collection
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close collection"
            >
              <X size={24} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="secondary" className="text-base">
              🎯 {collection.stats.uniqueCount} / {totalEmojis} Unique
            </Badge>
            <Badge variant="secondary" className="text-base">
              ⭐ {collection.stats.totalCollected} Total Collections
            </Badge>
            <Badge variant="secondary" className="text-base">
              💯 {progress}% Complete
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Rarity filters */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setFilterRarity(null)}
              className={`text-sm ${
                filterRarity === null
                  ? 'bg-gray-700'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              All ({collection.stats.uniqueCount}/{totalEmojis})
            </Button>
            {Object.keys(EMOJI_POOLS).map((rarity) => {
              const config = RARITY_CONFIG[rarity];
              return (
                <Button
                  key={rarity}
                  onClick={() => setFilterRarity(rarity)}
                  className={`text-sm ${
                    filterRarity === rarity
                      ? `${config.bgColor} ${config.displayColor} border-2`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={{
                    borderColor:
                      filterRarity === rarity ? config.color : 'transparent',
                  }}
                >
                  {config.label} ({getRarityCounts(rarity)})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Emoji grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-3">
            {displayEmojis.map((emoji) => {
              const collected = isCollected(emoji);
              const count = getCount(emoji);
              const emojiRarity = filterRarity ||
                Object.keys(EMOJI_POOLS).find((r) =>
                  EMOJI_POOLS[r].includes(emoji)
                );
              const rarityConfig = RARITY_CONFIG[emojiRarity];

              return (
                <div
                  key={emoji}
                  className={`
                    relative aspect-square rounded-lg flex items-center justify-center text-4xl
                    transition-all duration-200
                    ${
                      collected
                        ? `${rarityConfig.bgColor} hover:scale-110 cursor-pointer shadow-md`
                        : 'bg-gray-100 opacity-30 grayscale cursor-not-allowed'
                    }
                  `}
                  title={
                    collected
                      ? `${emoji} - ${rarityConfig.label} (×${count})`
                      : `${emoji} - Not collected yet`
                  }
                >
                  <span className="select-none">{emoji}</span>

                  {/* Collection count badge (if collected multiple times) */}
                  {collected && count > 1 && (
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {count}
                    </div>
                  )}

                  {/* Rarity indicator dot */}
                  {collected && (
                    <div
                      className="absolute bottom-1 right-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: rarityConfig.color }}
                    />
                  )}

                  {/* First time collected indicator (sparkle) */}
                  {collected &&
                    collection.collectedEmojis[emoji]?.timesCollected === 1 && (
                      <div className="absolute -top-1 -left-1 text-yellow-400 text-xl">
                        ✨
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Tip: Rarer emojis have shorter lifetimes but give more points!
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionGallery;
