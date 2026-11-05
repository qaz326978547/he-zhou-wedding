<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-20 gap-2">
      <h1 class="text-lg font-semibold text-gray-800 whitespace-nowrap">座位安排</h1>
      <div class="flex items-center gap-2 flex-wrap justify-end">
        <RouterLink to="/admin" class="nav-btn">RSVP 管理</RouterLink>
        <RouterLink to="/admin/red-envelope" class="nav-btn">紅包登記</RouterLink>
        <button @click="handleLogout" class="nav-btn">登出</button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
        資料載入失敗，請重新整理頁面
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="stat-card">
          <div class="text-2xl font-bold text-gray-800">{{ totalSeated }} / {{ totalCapacity }}</div>
          <div class="text-xs text-gray-500 mt-1">已安排人數 / 總座位</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-gray-800">{{ usedTableCount }} / {{ TABLE_COUNT }}</div>
          <div class="text-xs text-gray-500 mt-1">已使用桌數</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-emerald-600">{{ fullTableCount }}</div>
          <div class="text-xs text-gray-500 mt-1">已滿桌數</div>
        </div>
        <div class="stat-card">
          <div class="text-2xl font-bold text-amber-600">{{ unassignedPeople }}</div>
          <div class="text-xs text-gray-500 mt-1">RSVP 未安排人數</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 items-center flex-wrap">
        <input v-model="searchQuery" placeholder="搜尋姓名，找出所在桌" class="edit-input !w-auto flex-1 min-w-[180px] !py-2" />
        <button @click="exportCsv" class="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-100 whitespace-nowrap transition">
          匯出 Excel
        </button>
      </div>
      <p v-if="searchQuery.trim()" class="text-xs text-gray-500 -mt-3">
        <template v-if="searchMatchTables.size">
          符合：{{ [...searchMatchTables].sort((a, b) => a - b).map(tableName).join('、') }}
        </template>
        <template v-else>找不到符合的姓名</template>
      </p>

      <!-- Side filter & stats -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm bg-white">
          <button
            v-for="o in SIDE_VIEWS"
            :key="o.value"
            @click="sideView = o.value"
            class="px-3 py-1.5 transition"
            :class="sideView === o.value ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'"
          >{{ o.label }}</button>
        </div>
        <span class="side-pill bg-blue-50 text-blue-700 border-blue-200">新郎方 {{ sideStats.groom.tables }} 桌・{{ sideStats.groom.people }} 人</span>
        <span class="side-pill bg-rose-50 text-rose-700 border-rose-200">新娘方 {{ sideStats.bride.tables }} 桌・{{ sideStats.bride.people }} 人</span>
        <span v-if="sideStats.none.tables" class="side-pill bg-gray-50 text-gray-600 border-gray-200">未設定 {{ sideStats.none.tables }} 桌・{{ sideStats.none.people }} 人</span>
        <button
          v-if="autoSideCandidates.length"
          @click="autoAssignSides"
          :disabled="autoSideLoading"
          class="ml-auto text-sm border border-gray-300 text-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50"
        >{{ autoSideLoading ? '標示中...' : `依賓客自動標示（${autoSideCandidates.length} 桌）` }}</button>
      </div>

      <div class="grid md:grid-cols-5 gap-5 items-start">
        <!-- Floor plan -->
        <div class="md:col-span-3 bg-white rounded-xl shadow-sm p-3 md:sticky md:top-20">
          <svg :viewBox="FLOOR_VIEWBOX" class="w-full h-auto max-h-[78vh] select-none" role="img" aria-label="草悟廳座位圖">
            <!-- Walls -->
            <g fill="none" stroke="#B03A2E" stroke-width="6" stroke-linecap="square">
              <path d="M585,225 L950,225 M585,225 L585,540 Q585,590 535,590 L412,590 Q390,590 390,612 L390,1272 L425,1272" />
              <path d="M500,1272 L555,1272 L555,1360" />
              <path d="M642,1275 L735,1275 L735,1320" />
              <path d="M735,1360 L880,1360" />
              <path d="M1012,1360 L1278,1360 L1278,210 L1105,210 L1105,240 L1045,240" />
              <path d="M1090,240 L1090,405 L1278,405" />
              <path d="M585,325 L988,325" />
            </g>
            <!-- Stage -->
            <path d="M627,327 L988,327 L988,408 Q805,490 627,408 Z" fill="#FBEFEC" stroke="#B03A2E" stroke-width="5" />
            <text x="805" y="390" text-anchor="middle" font-size="34" fill="#7A2A20" font-weight="600">舞台</text>
            <!-- Pillars -->
            <circle v-for="(p, i) in PILLARS" :key="'p' + i" :cx="p.x" :cy="p.y" r="27" fill="#B03A2E" />
            <!-- Entrance -->
            <path d="M950,1440 L950,1405 M935,1418 L950,1400 L965,1418" stroke="#B03A2E" stroke-width="6" fill="none" />
            <text x="950" y="1490" text-anchor="middle" font-size="32" fill="#B03A2E">入口</text>

            <!-- Tables -->
            <g
              v-for="t in TABLE_LAYOUT"
              :key="t.no"
              class="cursor-pointer"
              role="button"
              :aria-label="`${tableName(t.no)}，${seatedAt(t.no)} / ${capacityOf(t.no)} 人`"
              tabindex="0"
              @click="selectTable(t.no)"
              @keydown.enter="selectTable(t.no)"
              :opacity="isDimmed(t.no) ? 0.22 : 1"
            >
              <!-- selected / search ring -->
              <circle
                v-if="selectedTable === t.no || searchMatchTables.has(t.no)"
                :cx="t.x"
                :cy="t.y"
                :r="TABLE_RADIUS + 13"
                fill="none"
                :stroke="selectedTable === t.no ? '#1F2937' : '#F59E0B'"
                stroke-width="5"
                :stroke-dasharray="selectedTable === t.no ? undefined : '10 7'"
              />
              <circle
                :cx="t.x"
                :cy="t.y"
                :r="TABLE_RADIUS"
                :fill="tableFill(t.no)"
                :stroke="SIDE_META[sideKey(t.no)].color"
                :stroke-width="sideOf(t.no) ? 7 : 2.5"
              />
              <!-- side badge -->
              <g v-if="sideOf(t.no)">
                <circle :cx="t.x + 34" :cy="t.y - 34" r="17" :fill="SIDE_META[sideKey(t.no)].color" />
                <text :x="t.x + 34" :y="t.y - 27" text-anchor="middle" font-size="19" font-weight="700" fill="#FFFFFF">{{ SIDE_META[sideKey(t.no)].short }}</text>
              </g>
              <text :x="t.x" :y="t.y - 4" text-anchor="middle" font-size="30" font-weight="700" fill="#1F2937">{{ t.no === MAIN_TABLE_NO ? '主桌' : t.no }}</text>
              <text :x="t.x" :y="t.y + 28" text-anchor="middle" font-size="20" :fill="capacityOf(t.no) > TABLE_CAPACITY ? '#B45309' : '#4B5563'" :font-weight="capacityOf(t.no) > TABLE_CAPACITY ? 700 : 400">
                {{ seatedAt(t.no) }}/{{ capacityOf(t.no) }}
              </text>
              <text v-if="labelOf(t.no)" :x="t.x" :y="t.y + TABLE_RADIUS + 26" text-anchor="middle" font-size="22" fill="#374151">
                {{ labelOf(t.no) }}
              </text>
            </g>
          </svg>
          <div class="flex gap-4 justify-center text-xs text-gray-500 mt-2 flex-wrap">
            <span class="flex items-center gap-1"><span class="legend bg-white"></span>空桌</span>
            <span class="flex items-center gap-1"><span class="legend bg-amber-100"></span>未滿</span>
            <span class="flex items-center gap-1"><span class="legend bg-emerald-200"></span>已滿</span>
            <span class="flex items-center gap-1"><span class="legend-ring" style="border-color:#2563EB"></span>新郎方</span>
            <span class="flex items-center gap-1"><span class="legend-ring" style="border-color:#E11D74"></span>新娘方</span>
          </div>
        </div>

        <!-- Side panel -->
        <div ref="panelRef" class="md:col-span-2 space-y-4 scroll-mt-20">
          <!-- Selected table -->
          <div v-if="selectedTable !== null" class="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="text-xs text-gray-400">{{ baseTableName(selectedTable) }}</div>
                <div v-if="!editingLabel" class="flex items-center gap-2">
                  <h2 class="text-lg font-semibold text-gray-800 truncate">{{ tableName(selectedTable) }}</h2>
                  <button @click="startEditLabel" class="text-xs text-gray-400 hover:text-gray-600 underline whitespace-nowrap">改桌名</button>
                </div>
                <div v-else class="flex items-center gap-1 mt-1">
                  <input v-model="labelDraft" maxlength="20" placeholder="例如：主桌、新郎同事" class="edit-input" @keydown.enter="onLabelEnter" />
                  <button @click="saveLabel" :disabled="labelSaving" class="small-btn bg-gray-800 text-white disabled:opacity-50">儲存</button>
                  <button @click="editingLabel = false" class="small-btn border border-gray-300 text-gray-600">取消</button>
                </div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-2xl font-bold" :class="remaining(selectedTable) === 0 ? 'text-emerald-600' : 'text-gray-800'">
                  {{ seatedAt(selectedTable) }}<span class="text-sm text-gray-400">/{{ capacityOf(selectedTable) }}</span>
                </div>
                <div class="text-xs text-gray-400">剩 {{ remaining(selectedTable) }} 位</div>
                <div class="flex items-center gap-1 justify-end mt-1">
                  <span class="text-xs text-gray-500">座位數</span>
                  <button
                    @click="changeCapacity(-1)"
                    :disabled="capacitySaving || capacityOf(selectedTable) <= Math.max(seatedAt(selectedTable), 1)"
                    class="cap-btn"
                    aria-label="減少座位"
                  >−</button>
                  <span class="text-sm w-5 text-center font-medium">{{ capacityOf(selectedTable) }}</span>
                  <button
                    @click="changeCapacity(1)"
                    :disabled="capacitySaving || capacityOf(selectedTable) >= MAX_TABLE_CAPACITY"
                    class="cap-btn"
                    aria-label="加座"
                  >＋</button>
                </div>
                <div v-if="capacityOf(selectedTable) > TABLE_CAPACITY" class="text-[11px] text-amber-700 mt-0.5">
                  已加座 {{ capacityOf(selectedTable) - TABLE_CAPACITY }} 位
                </div>
                <p v-if="capacityError" class="text-red-500 text-xs mt-1 max-w-[160px]">{{ capacityError }}</p>
              </div>
            </div>

            <!-- Side -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs text-gray-500">方別</span>
              <div class="inline-flex rounded-lg border border-gray-300 overflow-hidden text-xs">
                <button
                  v-for="o in SIDE_OPTIONS"
                  :key="String(o.value)"
                  @click="setSide(o.value)"
                  :disabled="sideSaving"
                  class="px-3 py-1.5 transition disabled:opacity-50"
                  :class="sideOf(selectedTable) === o.value ? o.active : 'bg-white text-gray-600 hover:bg-gray-50'"
                >{{ o.label }}</button>
              </div>
              <button
                v-if="suggestedSide(selectedTable) && suggestedSide(selectedTable) !== sideOf(selectedTable)"
                @click="setSide(suggestedSide(selectedTable))"
                :disabled="sideSaving"
                class="text-xs text-blue-600 underline"
              >套用建議：{{ SIDE_META[suggestedSide(selectedTable)!].label }}</button>
            </div>
            <p v-if="compositionText(selectedTable)" class="text-xs text-gray-400 -mt-2">賓客組成：{{ compositionText(selectedTable) }}</p>
            <p v-if="sideError" class="text-red-500 text-xs -mt-2">{{ sideError }}</p>

            <!-- Guests at table -->
            <p v-if="guestsAt(selectedTable).length === 0" class="text-sm text-gray-400 text-center py-3">此桌尚未安排賓客</p>
            <ul v-else class="divide-y divide-gray-100 border border-gray-100 rounded-lg">
              <li v-for="g in guestsAt(selectedTable)" :key="g.id" class="p-3">
                <template v-if="editingId === g.id">
                  <div class="grid grid-cols-6 gap-2">
                    <div class="col-span-4"><label class="field-label">姓名</label><input v-model="editForm.name" class="edit-input" /></div>
                    <div class="col-span-2"><label class="field-label">人數</label><input v-model.number="editForm.count" type="number" min="1" :max="MAX_TABLE_CAPACITY" class="edit-input" /></div>
                    <div class="col-span-6"><label class="field-label">備註</label><input v-model="editForm.note" maxlength="100" placeholder="例如：素食、需兒童椅" class="edit-input" /></div>
                    <div class="col-span-6">
                      <label class="field-label">桌次（換桌）</label>
                      <select v-model.number="editForm.tableNo" class="edit-input">
                        <option v-for="t in TABLE_LAYOUT" :key="t.no" :value="t.no">
                          {{ tableName(t.no) }}（剩 {{ t.no === g.tableNo ? remaining(t.no) + g.count : remaining(t.no) }} 位）
                        </option>
                      </select>
                    </div>
                  </div>
                  <p v-if="editError" class="text-red-500 text-xs mt-2">{{ editError }}</p>
                  <div class="flex gap-2 mt-2">
                    <button @click="saveEdit(g)" :disabled="editLoading" class="flex-1 bg-gray-800 text-white rounded-lg py-2 text-sm min-h-[40px] disabled:opacity-50">
                      {{ editLoading ? '儲存中...' : '儲存' }}
                    </button>
                    <button @click="editingId = null" :disabled="editLoading" class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm min-h-[40px]">取消</button>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <div class="font-medium text-gray-800 truncate" :class="{ 'bg-blue-50': isSearchHit(g) }">
                        {{ g.name }} <span class="text-gray-500 font-normal">× {{ g.count }}</span>
                        <span v-if="g.rsvpId" class="ml-1 text-[10px] text-blue-500 border border-blue-200 rounded px-1 align-middle">RSVP</span>
                      </div>
                      <div v-if="g.note" class="text-xs text-gray-500 truncate">{{ g.note }}</div>
                    </div>
                    <div class="flex gap-1 shrink-0">
                      <button @click="startEdit(g)" class="small-btn border border-gray-300 text-gray-600 hover:bg-gray-50">修改</button>
                      <button @click="handleDelete(g)" class="small-btn border border-red-200 text-red-500 hover:bg-red-50">移除</button>
                    </div>
                  </div>
                </template>
              </li>
            </ul>

            <!-- Add guest -->
            <form @submit.prevent="addGuest" @keydown.enter="blockImeEnter" class="border-t pt-4 space-y-2">
              <div class="text-sm font-medium text-gray-700">新增賓客到此桌</div>
              <div class="grid grid-cols-6 gap-2">
                <input v-model="addForm.name" placeholder="姓名" maxlength="50" class="edit-input col-span-4" />
                <input v-model.number="addForm.count" type="number" min="1" :max="MAX_TABLE_CAPACITY" placeholder="人數" class="edit-input col-span-2" />
                <input v-model="addForm.note" placeholder="備註（選填）" maxlength="100" class="edit-input col-span-6" />
              </div>
              <p v-if="addError" class="text-red-500 text-xs">{{ addError }}</p>
              <button type="submit" :disabled="addLoading || remaining(selectedTable) === 0" class="w-full bg-gray-800 text-white rounded-lg py-2 text-sm min-h-[40px] disabled:opacity-50">
                {{ remaining(selectedTable) === 0 ? '此桌已滿（可按右上「＋」加座）' : addLoading ? '新增中...' : '加入此桌' }}
              </button>
            </form>

            <!-- Swap tables -->
            <div class="border-t pt-4 space-y-2">
              <div class="text-sm font-medium text-gray-700">與其他桌整桌互換</div>
              <div class="flex gap-2">
                <select v-model="swapTarget" class="edit-input">
                  <option :value="null" disabled>選擇要互換的桌</option>
                  <option v-for="t in TABLE_LAYOUT.filter((x) => x.no !== selectedTable)" :key="t.no" :value="t.no">
                    {{ tableName(t.no) }}（{{ seatedAt(t.no) }}/{{ capacityOf(t.no) }}）
                  </option>
                </select>
                <button
                  @click="swapTables"
                  :disabled="swapTarget === null || swapLoading"
                  class="small-btn bg-gray-800 text-white disabled:opacity-50 px-4"
                >
                  {{ swapLoading ? '互換中...' : '互換' }}
                </button>
              </div>
              <p class="text-xs text-gray-400">兩桌的賓客、桌名、座位數、方別會一起交換</p>
              <p v-if="swapError" class="text-red-500 text-xs">{{ swapError }}</p>
            </div>
          </div>

          <div v-else class="bg-white rounded-xl shadow-sm p-6 text-center text-sm text-gray-500">
            點選座位圖上的桌子，開始安排賓客
          </div>

          <!-- Unassigned RSVP -->
          <div class="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-sm font-semibold text-gray-700">RSVP 未安排（{{ unassignedRsvp.length }} 筆）</h3>
              <select v-model="sideFilter" class="edit-input !w-auto text-xs">
                <option value="all">全部</option>
                <option value="groom">新郎親友</option>
                <option value="bride">新娘親友</option>
              </select>
            </div>
            <p v-if="unassignedRsvp.length === 0" class="text-xs text-gray-400 text-center py-2">沒有未安排的出席賓客</p>
            <ul v-else class="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              <li v-for="r in unassignedRsvp" :key="r.id" class="py-2 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-sm text-gray-800 truncate">{{ r.name }} <span class="text-gray-500">× {{ rsvpCount(r) }}</span></div>
                  <div class="text-xs text-gray-400 truncate">
                    {{ r.relationshipSide === 'groom' ? '新郎親友' : r.relationshipSide === 'bride' ? '新娘親友' : '未填' }}
                    <template v-if="r.dietaryPreference && r.dietaryPreference !== 'regular'"> · {{ dietLabel(r.dietaryPreference) }}</template>
                    <template v-if="r.highchairCount"> · 兒童椅 {{ r.highchairCount }}</template>
                  </div>
                </div>
                <button
                  @click="addFromRsvp(r)"
                  :disabled="selectedTable === null || rsvpCount(r) > remaining(selectedTable) || addingRsvpId === r.id"
                  class="small-btn border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 shrink-0"
                  :title="selectedTable === null ? '請先選擇桌子' : rsvpCount(r) > remaining(selectedTable) ? '此桌座位不足' : ''"
                >
                  {{ selectedTable !== null ? `加入${baseTableName(selectedTable)}` : '先選桌' }}
                </button>
              </li>
            </ul>
            <p v-if="rsvpError" class="text-red-500 text-xs">{{ rsvpError }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import adminApi from '../../services/adminApi'
import {
  TABLE_LAYOUT,
  TABLE_CAPACITY,
  MAX_TABLE_CAPACITY,
  TABLE_COUNT,
  TABLE_RADIUS,
  PILLARS,
  FLOOR_VIEWBOX,
  MAIN_TABLE_NO,
  baseTableName,
} from '../../constants/seating'

interface SeatGuest {
  id: number
  tableNo: number
  name: string
  count: number
  note: string | null
  rsvpId: number | null
}

const router = useRouter()
const guests = ref<SeatGuest[]>([])
const labels = ref<Record<number, string | null>>({})
const capacities = ref<Record<number, number>>({})
const capacitySaving = ref(false)
type Side = 'groom' | 'bride'
const sides = ref<Record<number, Side | null>>({})
const sideView = ref<'all' | Side>('all')
const sideSaving = ref(false)
const sideError = ref('')
const autoSideLoading = ref(false)
const capacityError = ref('')
const swapTarget = ref<number | null>(null)
const swapLoading = ref(false)
const swapError = ref('')
const rsvpList = ref<any[]>([])
const loadError = ref(false)

const selectedTable = ref<number | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const sideFilter = ref<'all' | 'groom' | 'bride'>('all')

const editingLabel = ref(false)
const labelDraft = ref('')
const labelSaving = ref(false)

const editingId = ref<number | null>(null)
const editForm = ref({ name: '', count: 1, note: '', tableNo: 1 })
const editLoading = ref(false)
const editError = ref('')

const addForm = ref({ name: '', count: 1, note: '' })
const addLoading = ref(false)
const addError = ref('')

const addingRsvpId = ref<number | null>(null)
const rsvpError = ref('')

const totalCapacity = computed(() => TABLE_LAYOUT.reduce((s, t) => s + capacityOf(t.no), 0))

const seatedByTable = computed(() => {
  const map: Record<number, number> = {}
  for (const g of guests.value) map[g.tableNo] = (map[g.tableNo] ?? 0) + g.count
  return map
})
const totalSeated = computed(() => guests.value.reduce((s, g) => s + g.count, 0))
const usedTableCount = computed(() => Object.values(seatedByTable.value).filter((n) => n > 0).length)
const fullTableCount = computed(() => TABLE_LAYOUT.filter((t) => seatedAt(t.no) >= capacityOf(t.no)).length)

const seatedRsvpIds = computed(() => new Set(guests.value.map((g) => g.rsvpId).filter((id): id is number => !!id)))
const allUnassignedRsvp = computed(() => rsvpList.value.filter((r) => r.attending && !seatedRsvpIds.value.has(r.id)))
const unassignedRsvp = computed(() =>
  allUnassignedRsvp.value.filter((r) => sideFilter.value === 'all' || r.relationshipSide === sideFilter.value),
)
const unassignedPeople = computed(() => allUnassignedRsvp.value.reduce((s, r) => s + rsvpCount(r), 0))

const searchMatchTables = computed(() => {
  const q = searchQuery.value.trim()
  const set = new Set<number>()
  if (!q) return set
  for (const g of guests.value) if (g.name.includes(q)) set.add(g.tableNo)
  return set
})

function isSearchHit(g: SeatGuest) {
  const q = searchQuery.value.trim()
  return !!q && g.name.includes(q)
}

function seatedAt(no: number) {
  return seatedByTable.value[no] ?? 0
}
const SIDE_META = {
  groom: { label: '新郎方', short: '郎', color: '#2563EB' },
  bride: { label: '新娘方', short: '娘', color: '#E11D74' },
  none: { label: '未設定', short: '', color: '#B03A2E' },
} as const
const SIDE_OPTIONS: { value: Side | null; label: string; active: string }[] = [
  { value: 'groom', label: '新郎方', active: 'bg-blue-600 text-white' },
  { value: 'bride', label: '新娘方', active: 'bg-rose-600 text-white' },
  { value: null, label: '未設定', active: 'bg-gray-700 text-white' },
]
const SIDE_VIEWS: { value: 'all' | Side; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'groom', label: '新郎方' },
  { value: 'bride', label: '新娘方' },
]

const rsvpById = computed(() => new Map(rsvpList.value.map((r) => [r.id, r])))

function sideOf(no: number): Side | null {
  return sides.value[no] ?? null
}
function sideKey(no: number): Side | 'none' {
  return sideOf(no) ?? 'none'
}
function isDimmed(no: number) {
  return sideView.value !== 'all' && sideOf(no) !== sideView.value
}
/** 依桌上賓客的 RSVP 親友別加總人數 */
function composition(no: number) {
  const c = { groom: 0, bride: 0, unknown: 0 }
  for (const g of guestsAt(no)) {
    const side = g.rsvpId ? rsvpById.value.get(g.rsvpId)?.relationshipSide : null
    if (side === 'groom' || side === 'bride') c[side as Side] += g.count
    else c.unknown += g.count
  }
  return c
}
function compositionText(no: number) {
  const c = composition(no)
  const parts: string[] = []
  if (c.groom) parts.push(`新郎親友 ${c.groom} 人`)
  if (c.bride) parts.push(`新娘親友 ${c.bride} 人`)
  if (c.unknown) parts.push(`無 RSVP 資料 ${c.unknown} 人`)
  return parts.join('、')
}
/** 只有單一方的 RSVP 賓客時才給建議，雙方混坐不建議 */
function suggestedSide(no: number): Side | null {
  const c = composition(no)
  if (c.groom && !c.bride) return 'groom'
  if (c.bride && !c.groom) return 'bride'
  return null
}
const sideStats = computed(() => {
  const st = { groom: { tables: 0, people: 0 }, bride: { tables: 0, people: 0 }, none: { tables: 0, people: 0 } }
  for (const t of TABLE_LAYOUT) {
    const key = sideKey(t.no)
    if (key === 'none' && seatedAt(t.no) === 0) continue
    st[key].tables++
    st[key].people += seatedAt(t.no)
  }
  return st
})
const autoSideCandidates = computed(() =>
  TABLE_LAYOUT.filter((t) => !sideOf(t.no) && suggestedSide(t.no)).map((t) => t.no),
)

async function putSide(no: number, side: Side | null) {
  const res = await adminApi.put(`/api/admin/seating/tables/${no}`, { side })
  sides.value = { ...sides.value, [no]: res.data.data.side ?? null }
}

async function setSide(side: Side | null) {
  const no = selectedTable.value
  if (no === null) return
  sideError.value = ''
  sideSaving.value = true
  try {
    await putSide(no, side)
  } catch (err: any) {
    sideError.value = apiError(err, '方別更新失敗')
  } finally {
    sideSaving.value = false
  }
}

async function autoAssignSides() {
  const list = autoSideCandidates.value
  const desc = list.map((no) => `${baseTableName(no)} → ${SIDE_META[suggestedSide(no)!].label}`).join('\n')
  if (!window.confirm(`依桌上賓客的 RSVP 親友別，自動標示以下未設定的桌：\n\n${desc}\n\n雙方混坐或沒有 RSVP 資料的桌不會變動。`)) return
  autoSideLoading.value = true
  try {
    for (const no of list) await putSide(no, suggestedSide(no))
  } catch (err: any) {
    window.alert(apiError(err, '自動標示失敗，已完成的部分會保留'))
  } finally {
    autoSideLoading.value = false
  }
}

function capacityOf(no: number) {
  return capacities.value[no] ?? TABLE_CAPACITY
}
function remaining(no: number) {
  return Math.max(capacityOf(no) - seatedAt(no), 0)
}
function labelOf(no: number) {
  return labels.value[no] || ''
}
function tableName(no: number) {
  return labelOf(no) ? `${baseTableName(no)}・${labelOf(no)}` : baseTableName(no)
}
function guestsAt(no: number) {
  return guests.value.filter((g) => g.tableNo === no)
}
function tableFill(no: number) {
  const n = seatedAt(no)
  if (n >= capacityOf(no)) return '#A7F3D0'
  if (n > 0) return '#FEF3C7'
  return '#FFFFFF'
}
function rsvpCount(r: any) {
  return Math.max((r.adultCount ?? 0) + (r.childCount ?? 0), 1)
}
function dietLabel(v: string) {
  return ({ vegetarian: '素食', vegan: '全素' } as Record<string, string>)[v] ?? v
}
function apiError(err: any, fallback: string) {
  return err.response?.data?.message || err.response?.data?.details?.[0]?.message || fallback
}

onMounted(loadAll)

function applySeating(data: any) {
  guests.value = data.guests
  labels.value = Object.fromEntries(data.tables.map((t: any) => [t.tableNo, t.label]))
  capacities.value = Object.fromEntries(data.tables.map((t: any) => [t.tableNo, t.capacity]))
  sides.value = Object.fromEntries(data.tables.map((t: any) => [t.tableNo, t.side ?? null]))
}

async function loadAll() {
  loadError.value = false
  try {
    const [seatRes, rsvpRes] = await Promise.all([
      adminApi.get('/api/admin/seating'),
      adminApi.get('/api/admin/rsvp'),
    ])
    applySeating(seatRes.data.data)
    rsvpList.value = rsvpRes.data.data
  } catch {
    loadError.value = true
  }
}

async function selectTable(no: number) {
  selectedTable.value = no
  editingId.value = null
  editingLabel.value = false
  addError.value = ''
  capacityError.value = ''
  sideError.value = ''
  swapTarget.value = null
  swapError.value = ''
  rsvpError.value = ''
  if (window.innerWidth < 768) {
    await nextTick()
    panelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function startEditLabel() {
  if (selectedTable.value === null) return
  labelDraft.value = labelOf(selectedTable.value)
  editingLabel.value = true
}

async function saveLabel() {
  const no = selectedTable.value
  if (no === null) return
  labelSaving.value = true
  try {
    const res = await adminApi.put(`/api/admin/seating/tables/${no}`, { label: labelDraft.value })
    labels.value = { ...labels.value, [no]: res.data.data.label }
    editingLabel.value = false
  } catch (err: any) {
    window.alert(apiError(err, '桌名儲存失敗'))
  } finally {
    labelSaving.value = false
  }
}

/** 輸入法（注音、拼音）選字時按下的 Enter，不應視為送出 */
function isImeEnter(e: KeyboardEvent) {
  return e.isComposing || e.keyCode === 229
}
function blockImeEnter(e: KeyboardEvent) {
  if (isImeEnter(e)) e.preventDefault()
}
function onLabelEnter(e: KeyboardEvent) {
  if (isImeEnter(e)) return
  saveLabel()
}

async function swapTables() {
  const a = selectedTable.value
  const b = swapTarget.value
  if (a === null || b === null) return
  if (!window.confirm(`確定將「${tableName(a)}」與「${tableName(b)}」整桌互換？`)) return
  swapError.value = ''
  swapLoading.value = true
  try {
    const res = await adminApi.post('/api/admin/seating/tables/swap', { a, b })
    applySeating(res.data.data)
    swapTarget.value = null
  } catch (err: any) {
    swapError.value = apiError(err, '互換失敗')
  } finally {
    swapLoading.value = false
  }
}

async function changeCapacity(delta: number) {
  const no = selectedTable.value
  if (no === null) return
  capacityError.value = ''
  capacitySaving.value = true
  try {
    const res = await adminApi.put(`/api/admin/seating/tables/${no}`, { capacity: capacityOf(no) + delta })
    capacities.value = { ...capacities.value, [no]: res.data.data.capacity }
  } catch (err: any) {
    capacityError.value = apiError(err, '座位數更新失敗')
  } finally {
    capacitySaving.value = false
  }
}

async function addGuest() {
  const no = selectedTable.value
  if (no === null) return
  addError.value = ''
  const name = addForm.value.name.trim()
  const count = Number(addForm.value.count)
  if (!name) return (addError.value = '請輸入姓名')
  if (!Number.isInteger(count) || count < 1) return (addError.value = '人數須為正整數')
  if (count > remaining(no)) return (addError.value = `此桌剩餘 ${remaining(no)} 位`)

  addLoading.value = true
  try {
    const res = await adminApi.post('/api/admin/seating/guests', {
      tableNo: no,
      name,
      count,
      note: addForm.value.note.trim() || null,
    })
    guests.value.push(res.data.data)
    addForm.value = { name: '', count: 1, note: '' }
  } catch (err: any) {
    addError.value = apiError(err, '新增失敗')
  } finally {
    addLoading.value = false
  }
}

async function addFromRsvp(r: any) {
  const no = selectedTable.value
  if (no === null) return
  rsvpError.value = ''
  addingRsvpId.value = r.id
  try {
    const notes: string[] = []
    if (r.dietaryPreference && r.dietaryPreference !== 'regular') notes.push(dietLabel(r.dietaryPreference))
    if (r.highchairCount) notes.push(`兒童椅 ${r.highchairCount}`)
    const res = await adminApi.post('/api/admin/seating/guests', {
      tableNo: no,
      name: r.name,
      count: rsvpCount(r),
      note: notes.join('、') || null,
      rsvpId: r.id,
    })
    guests.value.push(res.data.data)
  } catch (err: any) {
    rsvpError.value = apiError(err, '加入失敗')
  } finally {
    addingRsvpId.value = null
  }
}

function startEdit(g: SeatGuest) {
  editingId.value = g.id
  editError.value = ''
  editForm.value = { name: g.name, count: g.count, note: g.note ?? '', tableNo: g.tableNo }
}

async function saveEdit(g: SeatGuest) {
  editError.value = ''
  const count = Number(editForm.value.count)
  if (!editForm.value.name.trim()) return (editError.value = '請輸入姓名')
  if (!Number.isInteger(count) || count < 1) return (editError.value = '人數須為正整數')

  editLoading.value = true
  try {
    const res = await adminApi.put(`/api/admin/seating/guests/${g.id}`, {
      tableNo: editForm.value.tableNo,
      name: editForm.value.name.trim(),
      count,
      note: editForm.value.note.trim() || null,
    })
    const idx = guests.value.findIndex((x) => x.id === g.id)
    if (idx !== -1) guests.value[idx] = res.data.data
    editingId.value = null
  } catch (err: any) {
    editError.value = apiError(err, '儲存失敗')
  } finally {
    editLoading.value = false
  }
}

async function handleDelete(g: SeatGuest) {
  if (!window.confirm(`確定將「${g.name}」從${tableName(g.tableNo)}移除？`)) return
  try {
    await adminApi.delete(`/api/admin/seating/guests/${g.id}`)
    guests.value = guests.value.filter((x) => x.id !== g.id)
  } catch (err: any) {
    window.alert(apiError(err, '移除失敗'))
  }
}

function handleLogout() {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}

function csvEscape(val: any): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function exportCsv() {
  const rows: any[][] = [['桌號', '桌名', '方別', '姓名', '人數', '備註']]
  for (const t of TABLE_LAYOUT) {
    const list = guestsAt(t.no)
    const sideLabel = sideOf(t.no) ? SIDE_META[sideKey(t.no)].label : ''
    for (const g of list) rows.push([baseTableName(t.no), labelOf(t.no), sideLabel, g.name, g.count, g.note ?? ''])
    rows.push([baseTableName(t.no), labelOf(t.no), sideLabel, '【小計】', seatedAt(t.no), `座位 ${capacityOf(t.no)}・剩 ${remaining(t.no)} 位`])
    rows.push([])
  }
  rows.push(['【統計摘要】'])
  rows.push(['已安排人數', totalSeated.value])
  rows.push(['新郎方', `${sideStats.value.groom.tables} 桌・${sideStats.value.groom.people} 人`])
  rows.push(['新娘方', `${sideStats.value.bride.tables} 桌・${sideStats.value.bride.people} 人`])
  rows.push(['總座位', totalCapacity.value])
  rows.push(['RSVP 未安排人數', unassignedPeople.value])

  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  const a = document.createElement('a')
  a.href = url
  a.download = `座位表_${get('year')}${get('month')}${get('day')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.nav-btn {
  @apply text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 whitespace-nowrap;
}
.stat-card {
  @apply bg-white rounded-xl shadow-sm p-4 text-center;
}
.edit-input {
  @apply border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-full bg-white;
}
.field-label {
  @apply text-xs text-gray-400;
}
.small-btn {
  @apply text-xs rounded px-2 py-1.5 whitespace-nowrap;
}
.cap-btn {
  @apply w-7 h-7 rounded border border-gray-300 text-gray-700 text-sm leading-none hover:bg-gray-50 disabled:opacity-30;
}
.side-pill {
  @apply text-xs border rounded-full px-2.5 py-1 whitespace-nowrap;
}
.legend-ring {
  @apply inline-block w-3 h-3 rounded-full border-[3px] bg-white;
}
.legend {
  @apply inline-block w-3 h-3 rounded-full border border-[#B03A2E];
}
</style>
