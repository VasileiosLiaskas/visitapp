import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Coordinate } from '../types/Coordinate';

type Props = {
  coordinate: Coordinate | null;
  suggestedCountry: string | null;
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, country: string, notes: string) => Promise<boolean>;
};

function AddPlaceModal({
  coordinate,
  suggestedCountry,
  visible,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setCountry(suggestedCountry ?? '');
    }
  }, [suggestedCountry, visible]);

  function close() {
    setName('');
    setCountry('');
    setNotes('');
    onClose();
  }

  async function save() {
    if (!name.trim() || !coordinate) {
      return;
    }

    setIsSaving(true);
    try {
      const saved = await onSave(name, country, notes);
      if (saved) {
        close();
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={close}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.eyebrow}>ADD TO YOUR JOURNAL</Text>
          <Text style={styles.title}>Where did you visit?</Text>
          <Text style={styles.subtitle}>
            The country is detected from the location you selected.
          </Text>

          <TextInput
            autoFocus
            onChangeText={setName}
            placeholder="Town or city"
            placeholderTextColor="#9AA49F"
            returnKeyType="next"
            style={styles.input}
            value={name}
          />
          <TextInput
            onChangeText={setCountry}
            placeholder={suggestedCountry ? 'Country (detected)' : 'Country (optional)'}
            placeholderTextColor="#9AA49F"
            style={styles.input}
            value={country}
          />
          <TextInput
            multiline
            onChangeText={setNotes}
            placeholder="A note about your visit (optional)"
            placeholderTextColor="#9AA49F"
            style={[styles.input, styles.notesInput]}
            textAlignVertical="top"
            value={notes}
          />
          {coordinate ? (
            <Text style={styles.coordinates}>
              {coordinate.latitude.toFixed(5)}, {coordinate.longitude.toFixed(5)}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable onPress={close} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!name.trim() || isSaving}
              onPress={save}
              style={[styles.saveButton, (!name.trim() || isSaving) && styles.disabledButton]}
            >
              <Text style={styles.saveText}>{isSaving ? 'Saving…' : 'Save place'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(20, 32, 27, 0.34)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 30,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#DDE3DD',
    borderRadius: 3,
    height: 5,
    marginBottom: 22,
    width: 42,
  },
  eyebrow: {
    color: '#287C67',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#21352E',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 5,
  },
  subtitle: {
    color: '#718078',
    fontSize: 14,
    marginBottom: 20,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F5F7F2',
    borderColor: '#E7ECE6',
    borderRadius: 13,
    borderWidth: 1,
    color: '#21352E',
    fontSize: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  notesInput: {
    height: 84,
    paddingTop: 13,
  },
  coordinates: {
    color: '#87938D',
    fontSize: 12,
    marginBottom: 16,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 3,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: '#E2E8E2',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  cancelText: {
    color: '#52635D',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#287C67',
    borderRadius: 14,
    flex: 1.4,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  disabledButton: {
    backgroundColor: '#A8C5BA',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AddPlaceModal;
