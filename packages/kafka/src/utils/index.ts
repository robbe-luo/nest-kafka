export function getMQToken(name?: string): string {
  return name ? `KafkaMessageQueue_${name}` : 'KafkaMessageQueue_default';
}

export const NO_QUEUE_FOUND = (name?: string) =>
  name
    ? `No Queue was found with the given name (${name}). Check your configuration.`
    : 'No Queue was found. Check your configuration.';

export const KAFKA_CONFIG_DEFAULT_TOKEN = 'KAFKA_CONFIG(default)';

export function getSharedConfigToken(configKey?: string): string {
  return configKey ? `KAFKA_CONFIG(${configKey})` : KAFKA_CONFIG_DEFAULT_TOKEN;
}
