<template>
  <FieldComponent />
</template>

<script setup>
  import { computed, onMounted, watch } from "vue";
  import { useField } from "vee-validate";

  defineOptions({
    name: "FiledValidatorComponent",
  });
  const props = defineProps({
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
    },
    validation: {
      type: Object,
      default: () => {},
      //TODO add validator if needed
    },
    input: {
      type: Object,
      required: true,
    },
    initialValue: {},
  });
  const modelValue = defineModel();

  const FieldComponent = () =>
    h(
      props.input.component,
      {
        ...props.input.props,
        modelValue: fieldValue.value,
        "onUpdate:modelValue": (value) => (fieldValue.value = value),
        "error-message": errorMessage.value,
        ...(validationProps.value.mode === "blur" && { onBlur: handleBlur }),
      },
      props.input.slots,
    );

  //TODO use toRef
  const validationProps = computed(() => props.validation || {});

  const fieldOptions = {
    label: props.label ?? "",
    initialValue: props.initialValue ?? modelValue.value,
    standalone: validationProps.value?.standalone || false,
    syncVModel: true,
    ...(validationProps.value.mode === "blur" && { validateOnValueUpdate: false }),
    // validateOnMount: validationProps.value.mode === "aggressive",
    //TODO try to make it work without an extra watch (look at the core functionality of the useField in relation to rule changes,
    //there were an interaction mode previously and they replaced it with silent mode search about it)
  };

  const fieldValue = computed({
    get() {
      return validationValue.value;
    },
    set(value) {
      validationValue.value = value;
      modelValue.value = value;
    },
  });
  const handleBlur = () => validate();

  const {
    errorMessage,
    meta,
    validate,
    value: validationValue,
  } = useField(props.name, validationProps.value.rules, fieldOptions);

  watch(
    () => meta.valid,
    (newValue, oldValue) => newValue && !oldValue && validate(),
  );

  //TODO maybe using watchEffect is a better approach
  const watchRules = async (rules) => {
    watch(
      () => rules,
      async () => {
        await validate();
      },
      { immediate: true, deep: true },
    );
  };

  onMounted(() => {
    if (validationProps.value.mode === "aggressive") watchRules(validationProps.value.rules);
  });
</script>
