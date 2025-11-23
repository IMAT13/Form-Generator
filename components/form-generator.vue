<template>
  <FormComponent />
</template>

<script setup>
  import { h, isRef, TransitionGroup } from "vue";
  import ValidatedFieldRenderer from "./validated-field-renderer.vue";

  const props = defineProps({
    name: { type: String, required: true },
    model: { type: Object, required: true },
    library: { type: Object, required: true },
    transition: { type: Boolean, default: true },
    scopeId: {
      type: String,
      required: false,
    },
  });

  const shouldRender = (input) => {
    if ("allowRender" in input) return toValue(input.allowRender);
    else return true;
  };

  const normalizedEvents = ({ models = {}, events = {} }) => ({
    ...Object.keys(models).reduce((result, key) => {
      result[`onUpdate:${key}`] = (newValue) => (models[key] = newValue);
      return result;
    }, {}),
    ...events,
  });
  const normalizedProps = ({ props = {}, models = {}, attrs = {} }) => ({
    ...props,
    ...models,
    ...attrs,
  });

  const toValue = (value) => {
    return isRef(value) ? value.value : value;
  };

  const resolveComponent = (component) => props.library[component] || component;

  const isPlainElement = (child) =>
    child.type === "plain" || !(child.type === "validated" || child.validation);

  const resolveChild = (child, index) => {
    if (typeof child === "string" || typeof child === "function") return child;
    return isPlainElement(child) ? renderPlainField(child, index) : renderValidatedField(child, index);
  };
  const resolveChildren = (input) => {
    if (!input?.children?.length) return [];
    return input.children.map((child, index) => resolveChild(child, index));
  };

  const resolveSlots = (input) => ({
    default: () => resolveChildren(input),
    ...Object.entries(input.slots ?? {}).reduce((acc, [name, slot], index) => {
      if (typeof slot === "object")
        acc[name] = () =>
          isPlainElement(slot) ? renderPlainField(slot, index) : renderValidatedField(slot, index);
      else if (typeof slot === "function")
        acc[name] = (payload) => {
          const input = slot(payload);
          return () =>
            isPlainElement(input) ? renderPlainField(input, index) : renderValidatedField(input, index);
        };
      return acc;
    }, {}),
  });
  const renderValidatedField = (input, index) =>
    shouldRender(input)
      ? h(ValidatedFieldRenderer, {
          key: index,
          [props.scopeId]: "",
          name: input.props?.name,
          label: input.props?.label,
          validation: input.validation,
          modelValue: input.models.modelValue,
          initialValue: input.props?.initialValue,
          "onUpdate:modelValue": (newValue) => (input.models.modelValue = newValue),
          input: {
            component: resolveComponent(input.as),
            props: {
              ...normalizedEvents(input),
              ...normalizedProps(input),
            },
            slots: resolveSlots(input),
          },
        })
      : null;

  const renderPlainField = (input, index) => {
    const component = resolveComponent(input.as);
    return shouldRender(input)
      ? h(
          component,
          {
            key: index,
            [props.scopeId]: "",
            ...normalizedEvents(input),
            ...normalizedProps(input),
          },
          resolveSlots(input),
        )
      : null;
  };

  const getFieldsArray = () =>
    Object.values(props.model).map((input, index) => {
      return isPlainElement(input) ? renderPlainField(input, index) : renderValidatedField(input, index);
    });

  const FormComponent = h(
    "form",
    props.transition
      ? h(
          TransitionGroup,
          {
            name: "formGroup",
          },
          getFieldsArray,
        )
      : getFieldsArray,
  );
</script>

<style lang="scss">
  .formGroup-move,
  .formGroup-enter-active {
    transition: all 0.5s ease;
  }

  .formGroup-enter-from,
  .formGroup-leave-to {
    opacity: 0;
  }

  .formGroup-leave-active {
    opacity: 0;
    position: absolute;
  }
</style>
