import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, Pressable } from 'react-native';
import strings from '@/lib/i18n';
interface ParentsGateProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ParentsGate({ visible, onClose, onSuccess }: ParentsGateProps) {
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (visible) {
      setQ1(Math.floor(Math.random() * 8) + 2); // 2~9
      setQ2(Math.floor(Math.random() * 8) + 2); // 2~9
      setAnswer('');
      setError(false);
    }
  }, [visible]);

  const handleSubmit = () => {
    if (parseInt(answer) === q1 * q2) {
      onSuccess();
      onClose();
    } else {
      setError(true);
      setAnswer('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white rounded-3xl p-6 w-full max-w-xs items-center shadow-clay-md">
          <Text className="text-xl font-bold text-gray-800 mb-2">{strings.parentsGate.title}</Text>
          <Text className="text-gray-500 mb-6 text-center">
            {strings.parentsGate.description}
          </Text>

          <View className="bg-magic-bg p-4 rounded-2xl mb-4 w-full items-center">
            <Text className="text-2xl font-bold text-magic-purple">
              {q1} × {q2} = ?
            </Text>
          </View>

          <TextInput
            className={`
              w-full bg-gray-50 border-2 rounded-xl p-3 text-center text-xl font-bold mb-2
              ${error ? 'border-red-400 text-red-500' : 'border-gray-200 text-gray-800'}
            `}
            keyboardType="number-pad"
            value={answer}
            onChangeText={(t) => {
              setAnswer(t);
              setError(false);
            }}
            placeholder={strings.parentsGate.inputPlaceholder}
            autoFocus
          />

          {error && (
            <Text className="text-red-500 text-sm mb-4">{strings.parentsGate.wrongAnswer}</Text>
          )}

          <View className="flex-row gap-3 w-full mt-2">
            <Pressable 
              onPress={onClose}
              className="flex-1 py-3 bg-gray-200 rounded-xl items-center"
              accessibilityRole="button"
              accessibilityLabel={strings.common.cancel}
            >
              <Text className="font-bold text-gray-600">{strings.common.cancel}</Text>
            </Pressable>
            <Pressable 
              onPress={handleSubmit}
              className="flex-1 py-3 bg-magic-purple rounded-xl items-center shadow-clay-sm"
              accessibilityRole="button"
              accessibilityLabel={strings.common.confirm}
            >
              <Text className="font-bold text-white">{strings.common.confirm}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
