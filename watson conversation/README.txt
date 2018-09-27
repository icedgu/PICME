[workspace-19fc335a-b139-4bab-8631-45247a08e1c6]
: watson-conversation workspace importing file. (JSON format)

- "intents"
 1) intent : name of the intent
 2) examples : user examples of the intent
 3) description : description of the intent

- "entities"
 1) entity : name of the entity
 2) values : examples of the entity
   1. value
   2. synonyms : synonyms of value.
   3. description

- "dialog_nodes" : dialog flow
 1) title : title of the node.
 2) output : output of the node.
 3) parent : parent node of the node.
 4) context : context variables for the node.
 5) next_step : next step of the node.
   1. conditions : conditions of next step requires.
   2. dialog_node : dialog node id of next step.
   3. preious_sibiling : privious node id.