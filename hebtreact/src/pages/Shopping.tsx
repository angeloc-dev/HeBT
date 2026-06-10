import {type ReactElement, useState} from "react";
import Container from "@/components/ui/Container.tsx";
import {FiPlus, FiSearch, FiX} from "react-icons/fi";
import InputText from "@/components/ui/InputText.tsx";
import Button from "@/components/ui/Button.tsx";

function Shopping(): ReactElement {
    const [isAddingShoppingListItem, setIsAddingShoppingListItem] = useState<boolean>(false);
    const [editingShoppingListItemId, setEditingShoppingListItemId] = useState<number | null>(null);

    const handleCancelForm = () => {
        setIsAddingShoppingListItem(false);
        setEditingShoppingListItemId(null);
    };
    return (
        <div className="flex flex-col gap-8 py-6 max-w-7xl mx-auto px-4">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-muted-foreground w-5 h-5" />
                        </div>
                        <InputText type="text" placeholder="Cerca una ricetta per nome o ingrediente..." className="pl-10" />
                    </div>
                    <Button onClick={() => isAddingShoppingListItem ? handleCancelForm() : setIsAddingShoppingListItem(true)} className="w-full md:w-auto h-12 px-6">
                        <span className="flex items-center justify-center gap-2 text-base font-bold text-foreground">
                            {isAddingShoppingListItem ? <FiX className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                            {isAddingShoppingListItem ? "Annulla Inserimento" : "Nuova Ricetta"}
                        </span>
                    </Button>
                </div>
            </Container>
            {isAddingShoppingListItem &&
                <Container>
                    <h1>Aggiunta nuovo piatto per lista spesa</h1>
                    <p>
                        Mostrare tutti i piatti presenti nel ricettario e far selezionare 1+ piatti
                        Verranno aggiunti o tolti tipo gli ingredienti dentro la ricetta (Draft-item)
                    </p>
                    <Button className="w-full md:w-auto h-12 px-6">
                        <span className="flex items-center justify-center gap-2 text-base font-bold text-foreground">
                            <FiX className="w-5 h-5" />
                            Annulla
                        </span>
                    </Button>
                    <Button className="w-full md:w-auto h-12 px-6">
                        <span className="flex items-center justify-center gap-2 text-base font-bold text-foreground">
                            <FiPlus className="w-5 h-5" />
                            Conferma
                        </span>
                    </Button>
                </Container>
            }
        </div>
    );
}

export default Shopping;