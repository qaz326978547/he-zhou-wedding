export interface RsvpPayload {
  name: string
  phone: string
  attending: boolean
  guestCount: number
  relationshipSide?: 'groom' | 'bride'
  relationshipType?: 'relative' | 'friend'
  dietaryPreference?: 'regular' | 'vegetarian' | 'no_beef' | 'no_pork' | 'other'
  notes?: string
}

export interface ApiResponse<T> {
  data: T
}

export interface RsvpStatus {
  enabled: boolean
}

export type DietaryPreference = NonNullable<RsvpPayload['dietaryPreference']>
export type RelationshipSide = NonNullable<RsvpPayload['relationshipSide']>
export type RelationshipType = NonNullable<RsvpPayload['relationshipType']>
