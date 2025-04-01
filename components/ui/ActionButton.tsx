import { TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";

interface ActionButtonProps {
    icon: IconSymbolName;
    title: string;
    color: string;
    onPress: () => void;
}


const ActionButton: React.FC<ActionButtonProps> = ({ icon, title, color, onPress}) => {
    return (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: color, borderRadius: 8, padding: 16, marginBottom: 4, shadowOffset: { width: 0, height: 2 }, shadowColor: 'black', shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, gap: 8 }} onPress={onPress}>
            <IconSymbol name={icon} color="black" size={32} />
            <ThemedText type="defaultSemiBold" style={{ marginLeft: 8, color: 'black' }}>{title}</ThemedText>
        </TouchableOpacity>
    );
}; 

export default ActionButton;
