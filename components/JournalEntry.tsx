import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Trash2, Clock, Calendar, RotateCcw } from 'lucide-react-native';
import { JournalEntry as JournalEntryType, useJournal, MoodType } from '@/hooks/useJournal';
import { formatTime } from '@/utils/dateUtils';

interface Props {
  entry: JournalEntryType;
  showRestore?: boolean;
}

const MOOD_EMOJIS: Record<MoodType, string> = {
  happy: '😊',
  sad: '😢',
  excited: '🤩',
  calm: '😌',
  anxious: '😰',
  grateful: '🙏',
  frustrated: '😤',
  content: '😌',
  energetic: '⚡',
  peaceful: '☮️',
};

export function JournalEntry({ entry, showRestore = false }: Props) {
  const { deleteEntry, archiveToCalendar, restoreEntry } = useJournal();
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const MAX_CHARS = 200;
  const shouldTruncate = entry.text.length > MAX_CHARS;
  const displayText = isExpanded || !shouldTruncate 
    ? entry.text 
    : entry.text.slice(0, MAX_CHARS);

  const handleDelete = () => {
    console.log('Delete entry requested');
    deleteEntry(entry.id);
  };

  const handleArchive = async () => {
    console.log('Archive to calendar requested');
    setIsArchiving(true);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      archiveToCalendar(entry.id);
      setIsArchiving(false);
    }, 300);
  };

  const handleRestore = async () => {
    console.log('Restore entry requested');
    setIsRestoring(true);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      restoreEntry(entry.id);
      setIsRestoring(false);
    }, 300);
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        entry.isArchivedToCalendar && styles.archivedContainer,
        isArchiving && styles.archivingContainer
      ]}
      onPress={() => shouldTruncate && setIsExpanded(!isExpanded)}
      activeOpacity={shouldTruncate ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <View style={styles.timeContainer}>
            <Clock size={14} color="#b8dda0" />
            <Text style={styles.timeText}>{formatTime(entry.createdAt)}</Text>
            {entry.isArchivedToCalendar && (
              <View style={styles.archivedBadge}>
                <Text style={styles.archivedBadgeText}>Archived</Text>
              </View>
            )}
            {entry.isDeleted && (
              <View style={styles.deletedBadge}>
                <Text style={styles.deletedBadgeText}>Deleted</Text>
              </View>
            )}
          </View>
          {entry.mood && (
            <View style={styles.moodContainer}>
              <Text style={styles.moodEmoji}>{MOOD_EMOJIS[entry.mood]}</Text>
              <Text style={styles.moodText}>{entry.mood}</Text>
            </View>
          )}
        </View>
        <View style={styles.topActionButtons}>
          {showRestore && entry.isDeleted ? (
            <TouchableOpacity
              style={[
                styles.restoreButton,
                isRestoring && styles.restoreButtonActive
              ]}
              onPress={handleRestore}
              disabled={isRestoring}
            >
              <RotateCcw size={16} color={isRestoring ? "#5e90c6" : "#b8dda0"} />
            </TouchableOpacity>
          ) : (
            !entry.isArchivedToCalendar && !entry.isDeleted && (
              <TouchableOpacity
                style={[
                  styles.archiveButton,
                  isArchiving && styles.archiveButtonActive
                ]}
                onPress={handleArchive}
                disabled={isArchiving}
              >
                <Calendar size={16} color={isArchiving ? "#5e90c6" : "#b8dda0"} />
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
      
      <Text style={styles.text}>
        {displayText}
        {shouldTruncate && !isExpanded && (
          <Text style={styles.moreText}> ...more</Text>
        )}
      </Text>
      
      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Bottom Right Delete Button */}
      <TouchableOpacity
        style={styles.deleteButtonBottomRight}
        onPress={handleDelete}
      >
        <Trash2 size={24} color="#2b7879" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a2414',
    borderRadius: 16,
    padding: 20,
    paddingBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#b8dda0',
    position: 'relative',
  },
  archivedContainer: {
    borderLeftColor: '#5e90c6',
    backgroundColor: 'rgba(94, 144, 198, 0.1)',
  },
  archivingContainer: {
    borderLeftColor: '#5e90c6',
    backgroundColor: 'rgba(94, 144, 198, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leftSection: {
    flex: 1,
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#b8dda0',
    marginLeft: 4,
    fontWeight: '500',
  },
  topActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  archiveButton: {
    padding: 4,
    borderRadius: 4,
  },
  archiveButtonActive: {
    backgroundColor: 'rgba(94, 144, 198, 0.2)',
  },
  deleteButtonBottomRight: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(43, 120, 121, 0.2)',
    borderWidth: 2,
    borderColor: '#2b7879',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#2b7879',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    color: '#e7f4df',
    lineHeight: 24,
  },
  moreText: {
    fontSize: 16,
    color: '#5e90c6',
    fontWeight: '600',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(184, 221, 160, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  moodEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  moodText: {
    fontSize: 12,
    color: '#e7f4df',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    backgroundColor: 'rgba(184, 221, 160, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#e7f4df',
    fontWeight: '500',
  },
  archivedBadge: {
    backgroundColor: '#5e90c6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  archivedBadgeText: {
    fontSize: 10,
    color: '#0c1508',
    fontWeight: '600',
  },
  deletedBadge: {
    backgroundColor: '#2b7879',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  deletedBadgeText: {
    fontSize: 10,
    color: '#e7f4df',
    fontWeight: '600',
  },
  restoreButton: {
    padding: 4,
    borderRadius: 4,
  },
  restoreButtonActive: {
    backgroundColor: 'rgba(94, 144, 198, 0.2)',
  },
});